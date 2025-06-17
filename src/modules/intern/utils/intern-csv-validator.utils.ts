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

    if (
      seenEmails.has(rowResult.row.email) ||
      existingEmails.has(rowResult.row.email)
    ) {
      errors.push('Email duplicado');
    } else {
      seenEmails.add(rowResult.row.email);
    }

    if (
      seenDocuments.has(rowResult.row.document) ||
      existingDocuments.has(rowResult.row.document)
    ) {
      errors.push('Documento duplicado');
    } else {
      seenDocuments.add(rowResult.row.document);
    }

    rowResult.errors = errors;
  }

  return parsedRows;
}
