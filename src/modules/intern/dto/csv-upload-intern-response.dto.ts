import { BatchCreateInternDto } from './batch-create-intern.dto';

export class CsvUploadInternResponseDto {
  validInterns: BatchCreateInternDto[];
  invalidRows: InvalidCsvRow[];
}

export class InvalidCsvRow {
  rowNumber: number;
  errors: string[];
  rawData: Record<string, string>;
}
