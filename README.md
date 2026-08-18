# AURA AI Resume Studio

Upload a PDF or DOCX resume, review AI-extracted portfolio data, choose one of 11 templates, and edit the generated portfolio.

## Setup

1. Run `npm install`.
2. Copy `.env.example` to `.env.local` and add a Gemini API key from Google AI Studio.
3. Run the complete frontend and API locally with `npx vercel dev`.

`npm run dev` runs only the Vite frontend, without the `/api` function.

For Vercel, add `GEMINI_API_KEY` in Project Settings → Environment Variables and redeploy. The key is server-only; never use a `VITE_` prefix.

## Resume API

`POST /api/resume/parse` accepts multipart form data with one `resume` file. Supported formats are PDF and DOCX, up to 10MB.
