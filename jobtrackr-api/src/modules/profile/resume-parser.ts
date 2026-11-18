import { BadRequestException, UnprocessableEntityException } from '@nestjs/common';
import pdf from 'pdf-parse/lib/pdf-parse.js';

export const MAX_RESUME_BYTES = 5 * 1024 * 1024;
/** Below this many characters we assume a scanned (image-only) PDF. */
const MIN_TEXT_CHARS = 200;

/** Extracts plain text from a resume PDF. Does not store anything. */
export async function extractResumeText(file?: Express.Multer.File): Promise<{ text: string; pages: number }> {
  if (!file) throw new BadRequestException('Choose a PDF file to upload.');
  const isPdf = file.mimetype === 'application/pdf' && file.buffer.subarray(0, 5).toString() === '%PDF-';
  if (!isPdf) throw new BadRequestException('Only PDF files are supported.');

  let parsed: { text: string; numpages: number };
  try {
    parsed = await pdf(file.buffer);
  } catch {
    throw new UnprocessableEntityException('This PDF could not be read. Try exporting it again, or paste the text.');
  }

  // Tidy extraction artefacts: trailing spaces, runs of blank lines.
  const text = parsed.text
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  if (text.length < MIN_TEXT_CHARS) {
    throw new UnprocessableEntityException(
      'No text found in this PDF. It may be a scanned image. Paste your resume text instead.'
    );
  }
  return { text, pages: parsed.numpages };
}
