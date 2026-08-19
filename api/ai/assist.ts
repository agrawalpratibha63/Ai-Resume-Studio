import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createRemoteJWKSet, jwtVerify } from 'jose';

const keys = createRemoteJWKSet(new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'));
async function authenticate(req: VercelRequest) {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const header = Array.isArray(req.headers.authorization) ? req.headers.authorization[0] : req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : '';
  if (!projectId || !token) throw new Error('UNAUTHORIZED');
  await jwtVerify(token, keys, { issuer: `https://securetoken.google.com/${projectId}`, audience: projectId });
}
const clean = (value: unknown, max = 3000) => typeof value === 'string' ? value.trim().slice(0, max) : '';
const list = (value: unknown, max = 20) => Array.isArray(value) ? value.map(v => clean(v, 120)).filter(Boolean).slice(0, max) : [];

async function generate(prompt: string, schema: Record<string, unknown>) {
  const models = [...new Set([process.env.GEMINI_MODEL, 'gemini-3.1-flash-lite', 'gemini-2.5-flash-lite'].map(v => v?.trim()).filter(Boolean))] as string[];
  for (const model of models) for (const withSchema of [true, false]) {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY || '' },
      body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }], generationConfig: { responseMimeType: 'application/json', ...(withSchema ? { responseJsonSchema: schema } : {}), temperature: 0.25, maxOutputTokens: 2048 } }),
      signal: AbortSignal.timeout(30_000),
    });
    const payload = await response.json() as Record<string, any>;
    const raw = payload?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text || '').join('').trim();
    if (response.ok && raw) return JSON.parse(raw.replace(/^```json\s*/i, '').replace(/```$/i, '')) as Record<string, unknown>;
    if (!(withSchema && response.status === 400)) break;
  }
  throw new Error('PROVIDER_FAILED');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });
  if (!process.env.GEMINI_API_KEY) return res.status(503).json({ error: 'Gemini is not configured.' });
  try {
    await authenticate(req);
    const body = req.body && typeof req.body === 'object' ? req.body as Record<string, unknown> : {};
    if (body.task === 'refine-bio') {
      const bio = clean(body.bio, 2500);
      if (bio.length < 10) return res.status(400).json({ error: 'Write a short bio first.' });
      const result = await generate(`Refine this portfolio bio in its current language. Keep every claim factual; never invent skills, employers, achievements or numbers. Use a confident natural first-person tone in 45-80 words. Return only {"bio":"..."}.\nTitle: ${clean(body.title, 150)}\nBio: ${bio}`, { type: 'object', required: ['bio'], properties: { bio: { type: 'string' } } });
      return res.status(200).json({ bio: clean(result.bio, 1200) });
    }
    if (body.task === 'refine-description') {
      const description = clean(body.description, 2500);
      if (description.length < 10) return res.status(400).json({ error: 'Write a short description first.' });
      const kind = clean(body.kind, 40) === 'experience' ? 'work experience' : 'project';
      const result = await generate(`Refine this ${kind} description for a professional portfolio. Preserve its language and every factual claim. Never invent technologies, employers, metrics, achievements, or responsibilities. Make it concise and readable in 30-65 words. Return only {"text":"..."}.\nOriginal description: ${description}`, { type: 'object', required: ['text'], properties: { text: { type: 'string' } } });
      return res.status(200).json({ text: clean(result.text, 1200) });
    }
    if (body.task === 'recommend-skills') {
      const title = clean(body.title, 150), bio = clean(body.bio, 1500), projects = list(body.projects, 12), experience = list(body.experience, 12), existing = list(body.existingSkills, 30);
      if (!title && !bio && !projects.length && !experience.length) return res.status(200).json({ skills: [] });
      const result = await generate(`Recommend up to 12 concise portfolio skills strongly supported or reasonably suggested by these details. Prefer specific tools and capabilities. Do not repeat existing skills or invent certifications. Return only {"skills":["..."]}.\nTitle: ${title}\nBio: ${bio}\nProjects: ${projects.join(' | ')}\nExperience: ${experience.join(' | ')}\nExisting: ${existing.join(', ')}`, { type: 'object', required: ['skills'], properties: { skills: { type: 'array', items: { type: 'string' }, maxItems: 12 } } });
      const seen = new Set(existing.map(v => v.toLowerCase()));
      return res.status(200).json({ skills: list(result.skills, 12).filter(v => !seen.has(v.toLowerCase())) });
    }
    return res.status(400).json({ error: 'Unknown AI task.' });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') return res.status(401).json({ error: 'Please sign in again.' });
    console.error('AI assist failed', error);
    return res.status(502).json({ error: 'AI could not complete this request. Please retry.' });
  }
}
