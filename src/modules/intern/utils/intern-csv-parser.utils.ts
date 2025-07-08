import { parse } from 'csv-parse/sync';
import { plainToInstance } from 'class-transformer';
import { BatchCreateInternDto } from '../dto/batch-create-intern.dto';

export interface ParsedRowResult {
  row: BatchCreateInternDto;
  errors: string[];
  originalRow: Record<string, string>;
  rowNumber: number;
}

export function parseCsvContent(content: string): ParsedRowResult[] {
  const records: Record<string, string>[] = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as Record<string, string>[];

  return records.map((record, index) => {
    const dto = plainToInstance(BatchCreateInternDto, record, {
      enableImplicitConversion: false,
      exposeDefaultValues: true,
    });

    return {
      row: dto,
      errors: [],
      originalRow: record,
      rowNumber: index + 2,
    };
  });
}
