import { parse } from 'csv-parse/sync';
import { CreateInternDto } from '../dto/create-intern.dto';

export interface RawInternCsvRow {
  tipo_documento: string;
  documento: string;
  correo: string;
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string;
  genero: string;
  telefono: string;
  universidad: string;
  carrera: string;
  otra_carrera: string;
  anio_graduacion: string;
  fuente: string;
  temas_interes: string;
  pais: string;
  departamento: string;
}

export function parseInternCsv(content: Buffer): RawInternCsvRow[] {
  return parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as RawInternCsvRow[];
}

const enums = {
  DocumentType: ['DNI', 'CE', 'PASSPORT'] as const,
  Gender: ['Masculino', 'Femenino', 'Prefiero_No_Decirlo'] as const,
  Major: [
    'Ingenieria_Ambiental',
    'Ingenieria_Forestal',
    'Biologia',
    'Gestion_Ambiental',
    'Otras',
  ] as const,
  TopicCode: ['HC', 'HH', 'CN'] as const,
  PeruDepartment: [
    'AMAZONAS',
    'ANCASH',
    'APURIMAC',
    'AREQUIPA',
    'AYACUCHO',
    'CAJAMARCA',
    'CALLAO',
    'CUSCO',
    'HUANCAVELICA',
    'HUANUCO',
    'ICA',
    'JUNIN',
    'LA_LIBERTAD',
    'LAMBAYEQUE',
    'LIMA_METROPOLITANA',
    'LIMA_PROVINCIAS',
    'LORETO',
    'MADRE_DE_DIOS',
    'MOQUEGUA',
    'PASCO',
    'PIURA',
    'PUNO',
    'SAN_MARTIN',
    'TACNA',
    'TUMBES',
    'UCAYALI',
  ] as const,
};

type DocumentType = (typeof enums.DocumentType)[number];
type Gender = (typeof enums.Gender)[number];
type Major = (typeof enums.Major)[number];
type TopicCode = (typeof enums.TopicCode)[number];
type PeruDepartment = (typeof enums.PeruDepartment)[number];

function normalizeEnumValue<T extends readonly string[]>(
  value: string | undefined,
  allowed: T,
): T[number] | null {
  if (!value) return null;
  const match = allowed.find(
    (v) => v.toLowerCase() === value.trim().toLowerCase(),
  );
  return match || null;
}

function mapRawToDto(row: RawInternCsvRow): [CreateInternDto | null, string[]] {
  const errors: string[] = [];

  const gender = normalizeEnumValue(row.genero, enums.Gender);
  if (!gender) errors.push(`Invalid gender: '${row.genero}'`);

  const documentType = normalizeEnumValue(
    row.tipo_documento,
    enums.DocumentType,
  );
  if (!documentType)
    errors.push(`Invalid document type: '${row.tipo_documento}'`);

  const majorInProgress = normalizeEnumValue(row.carrera, enums.Major);
  if (!majorInProgress) errors.push(`Invalid major: '${row.carrera}'`);

  const topics = row.temas_interes
    ?.split(',')
    .map((t) => t.trim().toUpperCase() as TopicCode)
    .filter((t) => t);
  const invalidTopics = topics.filter((t) => !enums.TopicCode.includes(t));
  if (invalidTopics.length > 0) {
    errors.push(`Invalid topic codes: ${invalidTopics.join(', ')}`);
  }

  const peruDepartment = row.departamento?.toUpperCase() as PeruDepartment;
  if (row.pais?.toLowerCase() === 'peru') {
    if (!enums.PeruDepartment.includes(peruDepartment)) {
      errors.push(`Invalid Peru department: '${row.departamento}'`);
    }
  }

  const dto: CreateInternDto = {
    documentType: documentType as DocumentType,
    document: row.documento,
    email: row.correo,
    firstNames: row.nombres,
    lastNameFather: row.apellido_paterno,
    lastNameMother: row.apellido_materno,
    gender: gender as Gender,
    phone: row.telefono,
    universityName: row.universidad,
    majorInProgress: majorInProgress as Major,
    graduationYear: parseInt(row.anio_graduacion),
    referralSource: row.fuente,
    topicsOfInterest: topics,
    country: row.pais,
    otherMajor: row.otra_carrera || undefined,
    peruDepartment:
      row.pais?.toLowerCase() === 'peru' ? peruDepartment : undefined,
  };

  if (dto.country.toLowerCase() === 'peru' && !dto.peruDepartment) {
    errors.push('peruDepartment is required when country is Peru');
  }

  if (dto.majorInProgress === 'Otras' && !dto.otherMajor) {
    errors.push('otherMajor is required when majorInProgress is Otras');
  }

  if (isNaN(dto.graduationYear)) {
    errors.push('graduationYear must be a number');
  }

  return [errors.length ? null : dto, errors];
}

export function parseAndValidateCsv(
  rawRows: RawInternCsvRow[],
): { dto: CreateInternDto | null; errors: string[]; row: number }[] {
  const results: {
    dto: CreateInternDto | null;
    errors: string[];
    row: number;
  }[] = [];

  const seenDocuments = new Map<string, number>();
  const seenEmails = new Map<string, number>();

  for (let i = 0; i < rawRows.length; i++) {
    const raw = rawRows[i];
    const [dto, errors] = mapRawToDto(raw);

    const doc = raw.documento.trim();
    if (seenDocuments.has(doc)) {
      const prevRow = seenDocuments.get(doc)! + 2;
      errors.push(`Duplicate document in CSV (also in row ${prevRow})`);
    } else {
      seenDocuments.set(doc, i);
    }

    const email = raw.correo.trim().toLowerCase();
    if (seenEmails.has(email)) {
      const prevRow = seenEmails.get(email)! + 2;
      errors.push(`Duplicate email in CSV (also in row ${prevRow})`);
    } else {
      seenEmails.set(email, i);
    }

    results.push({
      dto,
      errors,
      row: i + 2,
    });
  }

  return results;
}
