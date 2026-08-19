import type { VercelRequest, VercelResponse } from '@vercel/node';
import formidable, { type File } from 'formidable';
import mammoth from 'mammoth';
import { readFile } from 'node:fs/promises';
import { createRemoteJWKSet, jwtVerify } from 'jose';

export const config = { api: { bodyParser: false } };

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const PDF = 'application/pdf';
const DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const firebaseKeys = createRemoteJWKSet(new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'));

async function requireFirebaseUser(req: VercelRequest) {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const authorization = Array.isArray(req.headers.authorization) ? req.headers.authorization[0] : req.headers.authorization;
  const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : '';
  if (!projectId || !token) throw new Error('UNAUTHORIZED');
  const verified = await jwtVerify(token, firebaseKeys, {
    issuer: `https://securetoken.google.com/${projectId}`,
    audience: projectId,
  });
  return verified.payload.sub;
}

const text = { type: 'string' };
const additionalItemSchema = {
  type: 'object', additionalProperties: false,
  required: ['heading', 'subheading', 'period', 'description', 'url'],
  properties: { heading: text, subheading: text, period: text, description: text, url: text },
};

const portfolioSchema = {
  type: 'object', additionalProperties: false,
  required: ['profile', 'about', 'skills', 'experience', 'education', 'projects', 'certificates', 'contact', 'socialLinks', 'additionalSections'],
  properties: {
    profile: { type: 'object', additionalProperties: false, required: ['name', 'title', 'location'], properties: { name: text, title: text, location: text } },
    about: text,
    skills: { type: 'array', items: text },
    experience: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['company', 'role', 'period', 'description'], properties: { company: text, role: text, period: text, description: text } } },
    education: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['school', 'degree', 'period'], properties: { school: text, degree: text, period: text } } },
    projects: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['title', 'description', 'tags', 'url'], properties: { title: text, description: text, tags: { type: 'array', items: text }, url: text } } },
    certificates: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['title', 'issuer', 'date'], properties: { title: text, issuer: text, date: text } } },
    contact: { type: 'object', additionalProperties: false, required: ['email', 'phone', 'address'], properties: { email: text, phone: text, address: text } },
    socialLinks: { type: 'object', additionalProperties: false, required: ['linkedin', 'github', 'twitter', 'portfolio'], properties: { linkedin: text, github: text, twitter: text, portfolio: text } },
    additionalSections: {
      type: 'array',
      items: {
        type: 'object', additionalProperties: false,
        required: ['title', 'items'],
        properties: { title: text, items: { type: 'array', items: additionalItemSchema } },
      },
    },
  },
};

function firstFile(value: File | File[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function stringValue(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function stringList(value: unknown) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map(stringValue).filter(Boolean))];
}

function objectList(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object' && !Array.isArray(item)) : [];
}

function normalizePortfolio(raw: unknown) {
  const value = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw as Record<string, unknown> : {};
  const profile = value.profile && typeof value.profile === 'object' ? value.profile as Record<string, unknown> : {};
  const contact = value.contact && typeof value.contact === 'object' ? value.contact as Record<string, unknown> : {};
  const social = value.socialLinks && typeof value.socialLinks === 'object' ? value.socialLinks as Record<string, unknown> : {};

  return {
    profile: { name: stringValue(profile.name), title: stringValue(profile.title), location: stringValue(profile.location), photo: '' },
    about: stringValue(value.about),
    skills: stringList(value.skills),
    experience: objectList(value.experience).map((item) => ({ company: stringValue(item.company), role: stringValue(item.role), period: stringValue(item.period), description: stringValue(item.description) })).filter((item) => item.company || item.role || item.description),
    education: objectList(value.education).map((item) => ({ school: stringValue(item.school), degree: stringValue(item.degree), period: stringValue(item.period) })).filter((item) => item.school || item.degree),
    projects: objectList(value.projects).map((item) => ({ title: stringValue(item.title), description: stringValue(item.description), tags: stringList(item.tags), url: stringValue(item.url), image: '' })).filter((item) => item.title || item.description),
    certificates: objectList(value.certificates).map((item) => ({ title: stringValue(item.title), issuer: stringValue(item.issuer), date: stringValue(item.date), image: '' })).filter((item) => item.title || item.issuer),
    contact: { email: stringValue(contact.email), phone: stringValue(contact.phone), address: stringValue(contact.address) },
    socialLinks: { linkedin: stringValue(social.linkedin), github: stringValue(social.github), twitter: stringValue(social.twitter), portfolio: stringValue(social.portfolio) },
    additionalSections: objectList(value.additionalSections).map((section) => ({
      title: stringValue(section.title),
      items: objectList(section.items).map((item) => ({ heading: stringValue(item.heading), subheading: stringValue(item.subheading), period: stringValue(item.period), description: stringValue(item.description), url: stringValue(item.url) })).filter((item) => item.heading || item.description),
    })).filter((section) => section.title && section.items.length),
  };
}

function detectedMime(file: File) {
  const name = (file.originalFilename || '').toLowerCase();
  if (file.mimetype === PDF || name.endsWith('.pdf')) return PDF;
  if (file.mimetype === DOCX || name.endsWith('.docx')) return DOCX;
  return '';
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });
  if (!process.env.GEMINI_API_KEY) return res.status(503).json({ error: 'Gemini is not configured. Add GEMINI_API_KEY in Vercel.' });

  try {
    await requireFirebaseUser(req);
    const form = formidable({ maxFiles: 1, maxFileSize: MAX_FILE_SIZE, allowEmptyFiles: false, multiples: false });
    const [, files] = await form.parse(req);
    const resume = firstFile(files.resume);
    const mimeType = resume ? detectedMime(resume) : '';
    if (!resume || !mimeType) return res.status(400).json({ error: 'Please upload a valid PDF or DOCX resume.' });

    const bytes = await readFile(resume.filepath);
    if (!bytes.length) return res.status(400).json({ error: 'The uploaded resume is empty.' });

    const prompt = `You are a high-accuracy resume parser for a portfolio website.
Read every page and extract every factual section, including multi-column layouts and scanned PDF text.

Rules:
- Never invent employers, dates, degrees, metrics, skills, links, achievements, contact details, or job titles.
- Preserve the resume's language. Do not translate unless needed to keep a proper name readable.
- Use empty strings or arrays when information is missing.
- Keep every meaningful experience, project, education item, certificate, and URL.
- Put awards, achievements, publications, research, volunteering, positions of responsibility, languages, interests and any other non-core section in additionalSections. Do not duplicate core sections there.
- Derive project tags only from technologies explicitly named in that project's resume content.
- Combine bullet points into concise, factual portfolio-ready descriptions without losing metrics or outcomes.
- Create about from resume facts only, maximum 80 words.
- Return only JSON with these exact top-level keys: profile, about, skills, experience, education, projects, certificates, contact, socialLinks, additionalSections.`;

    let documentPart: Record<string, unknown>;
    if (mimeType === PDF) {
      documentPart = { inlineData: { mimeType: PDF, data: bytes.toString('base64') } };
    } else {
      const extracted = (await mammoth.extractRawText({ buffer: bytes })).value.trim();
      if (!extracted) return res.status(422).json({ error: 'No readable text was found in this DOCX resume.' });
      documentPart = { text: `Resume text extracted from DOCX:\n\n${extracted}` };
    }

    const models = [...new Set([
      process.env.GEMINI_MODEL,
      'gemini-3.1-flash-lite',
      'gemini-2.5-flash-lite',
    ].map((model) => model?.trim()).filter(Boolean))] as string[];

    let payload: Record<string, any> | undefined;
    let providerStatus = 502;
    let usedModel = '';
    let lastProviderMessage = '';

    modelLoop: for (const model of models) {
      // First use Gemini's current JSON Schema field. If a provider/model rejects
      // structured output, retry once in JSON-only mode and validate locally.
      for (const withSchema of [true, false]) {
       try {
        const aiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: prompt }, documentPart] }],
            generationConfig: {
              responseMimeType: 'application/json',
              ...(withSchema ? { responseJsonSchema: portfolioSchema } : {}),
              temperature: 0.1,
              maxOutputTokens: 16384,
            },
          }),
          signal: AbortSignal.timeout(45_000),
        });

        const currentPayload = await aiResponse.json() as Record<string, any>;
        providerStatus = aiResponse.status;
        lastProviderMessage = stringValue(currentPayload?.error?.message);
        if (aiResponse.ok && currentPayload?.candidates?.length) {
          payload = currentPayload;
          usedModel = model;
          break modelLoop;
        }
        console.error('Gemini API error', { model, withSchema, status: aiResponse.status, message: lastProviderMessage });
        // A schema-free retry is useful for schema-related 400 responses. For
        // quota/auth/model errors move directly to the next model.
        if (withSchema && aiResponse.status === 400) continue;
        break;
      } catch (providerError) {
        lastProviderMessage = providerError instanceof Error ? providerError.message : 'Gemini request failed';
        console.error('Gemini request failed', { model, withSchema, message: lastProviderMessage });
        break;
       }
      }
    }

    if (!payload?.candidates) {
      const hint = providerStatus === 400
        ? 'Gemini could not read this document.'
        : providerStatus === 401 || providerStatus === 403
          ? 'Please verify GEMINI_API_KEY in Vercel.'
          : providerStatus === 429
            ? 'Gemini quota is exhausted. Check billing/quota or retry later.'
            : 'Gemini did not complete the extraction.';
      return res.status(502).json({ error: `${hint} Provider status: ${providerStatus}.`, details: lastProviderMessage });
    }

    const rawText = payload.candidates[0]?.content?.parts?.map((part: { text?: string }) => part.text || '').join('').trim();
    if (!rawText) return res.status(422).json({ error: 'Gemini found no readable resume content.' });

    let parsed: unknown;
    try {
      parsed = JSON.parse(rawText.replace(/^\`\`\`json\s*/i, '').replace(/\`\`\`$/i, ''));
    } catch {
      return res.status(502).json({ error: 'Gemini returned an invalid structured response. Please retry once.' });
    }

    const data = normalizePortfolio(parsed);
    if (!data.profile.name && !data.about && !data.experience.length && !data.education.length && !data.projects.length) {
      return res.status(422).json({ error: 'The document did not contain enough recognizable resume information.' });
    }

    return res.status(200).json({
      data,
      meta: {
        model: usedModel,
        sourceType: mimeType === PDF ? 'PDF' : 'DOCX',
        extractedSections: ['skills', 'experience', 'education', 'projects', 'certificates', 'additionalSections'].filter((key) => Array.isArray(data[key as keyof typeof data]) && (data[key as keyof typeof data] as unknown[]).length),
      },
    });
  } catch (error) {
    console.error('Resume parsing failed', error);
    const errorCode = typeof error === 'object' && error && 'code' in error ? String(error.code) : '';
    if (error instanceof Error && (error.message === 'UNAUTHORIZED' || errorCode === 'ERR_JWT_EXPIRED' || errorCode === 'ERR_JWS_SIGNATURE_VERIFICATION_FAILED')) {
      return res.status(401).json({ error: 'Your session is invalid or expired. Please sign in again.' });
    }
    const message = error instanceof Error && error.message.includes('maxFileSize')
      ? 'This resume is larger than 10MB.'
      : 'Resume parsing failed. Please check the file and try again.';
    return res.status(500).json({ error: message });
  }
}
