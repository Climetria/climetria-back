import * as csvParser from 'csv-parse/sync';
import { plainToInstance } from 'class-transformer';
import { BatchCreateInternDto } from '../dto/batch-create-intern.dto';

export interface ParsedRowResult {
  row: BatchCreateInternDto;
  errors: string[];
  originalRow: Record<string, string>;
}

export function parseCsvContent(content: string): ParsedRowResult[] {
  const records = csvParser.parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as Array<Record<string, string>>;

  return records.map((record) => {
    const dto = plainToInstance(BatchCreateInternDto, record, {
      enableImplicitConversion: false,
      exposeDefaultValues: true,
    });
    return {
      row: dto,
      errors: [],
      originalRow: record,
    };
  });
}
