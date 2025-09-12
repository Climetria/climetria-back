import { parse } from 'csv-parse/sync';
import {
  CreateOrganizationDto,
  CreateOrganizationFilterDto,
} from '../dto/create-organization.dto';

export interface RawOrganizationCsvRow {
  ruc: string;
  correo: string;
  nombre_contacto: string;
  telefono: string;
  pais: string;
  nombre_organizacion: string;
  tamano_organizacion: string;
  sector: string;
  temas_interes: string;
  max_internos?: string;
  departamentos_de_residencia?: string;
  carreras?: string;
  genero_preferido?: string;
  requisitos_extra?: string;
}

export function parseOrganizationCsv(content: Buffer): RawOrganizationCsvRow[] {
  return parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as RawOrganizationCsvRow[];
}

const enums = {
  OrganizationSize: ['SMALL', 'LARGE'] as const,
  TopicCode: ['HC', 'HH', 'CN'] as const,
  Major: [
    'ENVIRONMENTAL_ENGINEERING',
    'FOREST_ENGINEERING',
    'BIOLOGY',
    'ENVIRONMENTAL_MANAGEMENT',
    'OTHERS',
  ] as const,
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
  GenderSelection: ['MALE_ONLY', 'FEMALE_ONLY', 'BOTH'] as const,
};

type OrganizationSize = (typeof enums.OrganizationSize)[number];
type TopicCode = (typeof enums.TopicCode)[number];
type Major = (typeof enums.Major)[number];
type PeruDepartment = (typeof enums.PeruDepartment)[number];
type GenderSelection = (typeof enums.GenderSelection)[number];

function mapRawToDto(
  row: RawOrganizationCsvRow,
  validateFilter: boolean,
): [
  {
    organization: CreateOrganizationDto;
    filter?: CreateOrganizationFilterDto;
  } | null,
  string[],
] {
  const errors: string[] = [];

  const organizationSize =
    row.tamano_organizacion?.toUpperCase() as OrganizationSize;
  if (!enums.OrganizationSize.includes(organizationSize)) {
    errors.push(`Invalid organization size: '${row.tamano_organizacion}'`);
  }

  const topics = row.temas_interes
    ?.split(',')
    .map((t) => t.trim().toUpperCase() as TopicCode)
    .filter((t) => t);
  const invalidTopics = topics.filter((t) => !enums.TopicCode.includes(t));
  if (invalidTopics.length > 0) {
    errors.push(`Invalid topic codes: ${invalidTopics.join(', ')}`);
  }

  const dto: CreateOrganizationDto = {
    ruc: row.ruc,
    email: row.correo,
    contactName: row.nombre_contacto,
    phone: row.telefono,
    country: row.pais,
    organizationName: row.nombre_organizacion,
    organizationSize,
    sector: row.sector,
    topicsOfInterest: topics,
  };

  let filterDto: CreateOrganizationFilterDto | undefined = undefined;

  if (validateFilter) {
    const majors = (row.carreras ?? '')
      .split(',')
      .map((m) => m.trim().toUpperCase() as Major)
      .filter((m) => m);
    const invalidMajors = majors.filter((m) => !enums.Major.includes(m));
    if (invalidMajors.length > 0) {
      errors.push(`Invalid majors: ${invalidMajors.join(', ')}`);
    }

    const departments = (row.departamentos_de_residencia ?? '')
      ?.split(',')
      .map((d) => d.trim().toUpperCase() as PeruDepartment)
      .filter((d) => d);
    const invalidDepartments = departments.filter(
      (d) => !enums.PeruDepartment.includes(d),
    );
    if (invalidDepartments.length > 0) {
      errors.push(`Invalid Peru departments: ${invalidDepartments.join(', ')}`);
    }

    const genderFilter = row.genero_preferido?.toUpperCase() as GenderSelection;
    if (!enums.GenderSelection.includes(genderFilter)) {
      errors.push(`Invalid gender filter: '${row.genero_preferido}'`);
    }

    const maxInterns = parseInt(row.max_internos || '');
    if (isNaN(maxInterns)) {
      errors.push('maximumNumberOfInterns must be a number');
    }

    filterDto = {
      maximumNumberOfInterns: maxInterns,
      studiedMajorFilter: majors ?? [],
      placeOfResidenceFilter: departments ?? [],
      genderFilter,
      extraRequirements: row.requisitos_extra?.trim() || undefined,
    };
  }

  return [
    errors.length ? null : { organization: dto, filter: filterDto },
    errors,
  ];
}

export function parseAndValidateOrganizationCsv(
  rawRows: RawOrganizationCsvRow[],
  validateFilter: boolean,
): {
  dto: {
    organization: CreateOrganizationDto;
    filter?: CreateOrganizationFilterDto;
  } | null;
  errors: string[];
  row: number;
}[] {
  const results: {
    dto: {
      organization: CreateOrganizationDto;
      filter?: CreateOrganizationFilterDto;
    } | null;
    errors: string[];
    row: number;
  }[] = [];

  const seenRucs = new Map<string, number>();
  const seenEmails = new Map<string, number>();

  for (let i = 0; i < rawRows.length; i++) {
    const raw = rawRows[i];
    const [dto, errors] = mapRawToDto(raw, validateFilter);

    const ruc = raw.ruc.trim();
    if (seenRucs.has(ruc)) {
      const prevRow = seenRucs.get(ruc)! + 2;
      errors.push(`Duplicate RUC in CSV (also in row ${prevRow})`);
    } else {
      seenRucs.set(ruc, i);
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
