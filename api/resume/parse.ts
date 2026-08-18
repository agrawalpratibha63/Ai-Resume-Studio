import type { VercelRequest, VercelResponse } from '@vercel/node';
import formidable, { type File } from 'formidable';
import mammoth from 'mammoth';
import { readFile } from 'node:fs/promises';

export const config = { api: { bodyParser: false } };

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const allowedTypes = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

const portfolioSchema = {
  type: 'object', additionalProperties: false,
  required: ['profile', 'about', 'skills', 'experience', 'education', 'projects', 'certificates', 'contact', 'socialLinks'],
  properties: {
    profile: { type: 'object', additionalProperties: false, required: ['name', 'title', 'location'], properties: { name: { type: 'string' }, title: { type: 'string' }, location: { type: 'string' } } },
    about: { type: 'string' },
    skills: { type: 'array', items: { type: 'string' } },
    experience: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['company', 'role', 'period', 'description'], properties: { company: { type: 'string' }, role: { type: 'string' }, period: { type: 'string' }, description: { type: 'string' } } } },
    education: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['school', 'degree', 'period'], properties: { school: { type: 'string' }, degree: { type: 'string' }, period: { type: 'string' } } } },
    projects: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['title', 'description', 'tags', 'url'], properties: { title: { type: 'string' }, description: { type: 'string' }, tags: { type: 'array', items: { type: 'string' } }, url: { type: 'string' } } } },
    certificates: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['title', 'issuer', 'date'], properties: { title: { type: 'string' }, issuer: { type: 'string' }, date: { type: 'string' } } } },
    contact: { type: 'object', additionalProperties: false, required: ['email', 'phone', 'address'], properties: { email: { type: 'string' }, phone: { type: 'string' }, address: { type: 'string' } } },
    socialLinks: { type: 'object', additionalProperties: false, required: ['linkedin', 'github', 'twitter', 'portfolio'], properties: { linkedin: { type: 'string' }, github: { type: 'string' }, twitter: { type: 'string' }, portfolio: { type: 'string' } } },
  },
};

function firstFile(value: File | File[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });
  if (!process.env.GEMINI_API_KEY) return res.status(503).json({ error: 'AI service is not configured yet.' });

  try {
    const form = formidable({ maxFiles: 1, maxFileSize: MAX_FILE_SIZE, allowEmptyFiles: false });
    const [, files] = await form.parse(req);
    const resume = firstFile(files.resume);
    if (!resume || !allowedTypes.has(resume.mimetype || '')) {
      return res.status(400).json({ error: 'Please upload a valid PDF or DOCX resume.' });
    }

    const bytes = await readFile(resume.filepath);
    const prompt = `Extract portfolio information from this resume accurately.
- Never invent employers, dates, degrees, skills, links, achievements, or contact details.
- Use an empty string or empty array when information is absent.
- Preserve all meaningful projects, experience, education, certificates, links, and technical skills.
- Convert bullet points into concise portfolio-ready descriptions without changing facts.
- Create a short professional about paragraph only from facts present in the resume.
- Return only data matching the supplied JSON schema.`;

    const documentPart = resume.mimetype === 'application/pdf'
      ? { inlineData: { mimeType: 'application/pdf', data: bytes.toString('base64') } }
      : { text: `Resume text extracted from DOCX:\n\n${(await mammoth.extractRawText({ buffer: bytes })).value}` };

    const models = [...new Set([process.env.GEMINI_MODEL, 'gemini-2.5-flash-lite'].filter(Boolean))] as string[];
    let payload: any;
    let providerStatus = 502;

    for (const model of models) {
      const aiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY },
        body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }, documentPart] }], generationConfig: { responseMimeType: 'application/json', responseSchema: portfolioSchema, temperature: 0.1 } }),
        signal: AbortSignal.timeout(55_000),
      });

      payload = await aiResponse.json();
      providerStatus = aiResponse.status;
      if (aiResponse.ok) break;
      console.error('Gemini API error', { model, status: aiResponse.status, message: payload?.error?.message });
    }

    if (!payload?.candidates) {
      const hint = providerStatus === 401 || providerStatus === 403
        ? 'Please verify the Gemini API key in Vercel.'
        : providerStatus === 429
          ? 'The Gemini quota is temporarily exhausted. Please retry later.'
          : 'The AI provider rejected the request.';
      return res.status(502).json({ error: `${hint} (provider status ${providerStatus})` });
    }

    const rawText = payload?.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text || '').join('');
    if (!rawText) return res.status(422).json({ error: 'No readable resume content was found.' });
    const parsed = JSON.parse(rawText);

    return res.status(200).json({ data: {
      ...parsed,
      profile: { ...parsed.profile, photo: '' },
      projects: (parsed.projects || []).map((project: Record<string, unknown>) => ({ ...project, image: '' })),
      certificates: (parsed.certificates || []).map((certificate: Record<string, unknown>) => ({ ...certificate, image: '' })),
    } });
  } catch (error) {
    console.error('Resume parsing failed', error);
    return res.status(500).json({ error: 'Resume parsing failed. Please check the file and try again.' });
  }
}
