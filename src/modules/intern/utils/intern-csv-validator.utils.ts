import { validate } from 'class-validator';
import { ParsedRowResult } from './intern-csv-parser.utils';

export async function validateParsedRows(
  parsedRows: ParsedRowResult[],
  existingEmails: Set<string>,
  existingDocuments: Set<string>,
): Promise<ParsedRowResult[]> {
  const seenEmails = new Set<string>();
  const seenDocuments = new Set<string>();

  for (const rowResult of parsedRows) {
    const errors: string[] = [];

    const validationErrors = await validate(rowResult.row);

    if (validationErrors.length > 0) {
      const extractedErrors = validationErrors.flatMap((err) =>
        Object.values(err.constraints || {}),
      );
      errors.push(...extractedErrors);
    }

    const email = rowResult.row.email?.toLowerCase()?.trim();
    const document = rowResult.row.document?.trim();

    if (!email) {
      errors.push('Email is required');
    }

    if (!document) {
      errors.push('Document is required');
    }

    if (email) {
      if (seenEmails.has(email) || existingEmails.has(email)) {
        errors.push('Duplicate email');
      } else {
        seenEmails.add(email);
      }
    }

    if (document) {
      if (seenDocuments.has(document) || existingDocuments.has(document)) {
        errors.push('Duplicate document');
      } else {
        seenDocuments.add(document);
      }
    }

    rowResult.errors = errors;
  }

  return parsedRows;
}
