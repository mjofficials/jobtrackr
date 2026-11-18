# Phase 3: real AI, profile and resume upload

**Why:** Make the AI features real and visible in the UI. That's the resume project's headline feature.
**Goals:** Claude-backed match score, interview prep and follow-up email, using the resume plus application context. A profile page with PDF upload → extracted, editable resume text. An AI panel per application with past results.
**Non-goals:** storing the PDF file; streaming responses; per-user API keys.
**Anti-goals:** the app breaking without an API key (it must fall back to the mock); generic output that ignores the user's resume and notes.

## Approaches (decided in conversation)
- Resume: **upload PDF → server extracts text → editable textarea** (picked) vs paste-only vs sending the PDF to Claude on every call (higher per-call cost, needs file storage).
- Provider: `AI_PROVIDER` injection token; Claude when `ANTHROPIC_API_KEY` is set, else the mock.

## Design
- Model `claude-opus-5-5`, effort `medium`, structured outputs (`beta.messages.parse` + `betaZodOutputFormat`), server-side refusal fallbacks (`fallbacks: "default"`).
- Shapes: email `{subject, body}`; prep `{questions: string[]}`; match `{score 0-100, summary, strengths[], gaps[]}`.
- Match score requires resume text → 400 with "add your resume" guidance.
- Anthropic errors → 503 "AI service unavailable"; usage is only counted on success.
- `POST /profile/resume` (multipart `file`, PDF, ≤ 5 MB) → `{ text, pages }`; does **not** save. The user reviews, then saves via `PATCH /profile/update`. Scanned PDF (little text) → 422.
- `GET /ai?applicationId=` → logs with parsed output, for the panel's history.
- Web: `/profile` page (name, resume upload/textarea, usage meter); AI panel in a right-side sheet with Match / Interview prep / Follow-up tabs, opened from the card menu and the edit dialog.

## Plan
1. API: provider interface + mock + Claude provider + module factory + service/DTO changes + logs filter. Verify: build + curl with the mock.
2. API: resume upload endpoint. Verify: curl with a generated PDF.
3. Web: types/hooks, profile page + nav. Verify: tsc/lint + browser.
4. Web: AI sheet + entry points. Verify: tsc/lint + browser run with the mock (no key yet).
