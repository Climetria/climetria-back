import { InternResponseDto } from './intern-response.dto';

export class CsvUploadInternResponseDto {
  validInterns: InternResponseDto[];
  invalidRows: InvalidCsvRow[];
}

export class InvalidCsvRow {
  rowNumber: number;
  errors: string[];
  rawData: Record<string, string>;
}
