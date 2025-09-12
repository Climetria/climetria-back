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
  const result = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    quote: '"',
    escape: '"',
    relax_column_count: true,
  }) as RawOrganizationCsvRow[];

  return result;
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

export function mapRawToDto(
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

  // Convertir el objeto a un objeto normal para evitar problemas de acceso
  const normalRow = Object.fromEntries(Object.entries(row)) as Record<
    string,
    string
  >;

  // Validar campos requeridos
  const ruc = normalRow.ruc;
  const correo = normalRow.correo;
  const nombre_contacto = normalRow.nombre_contacto;
  const telefono = normalRow.telefono;
  const pais = normalRow.pais;
  const nombre_organizacion = normalRow.nombre_organizacion;
  const sector = normalRow.sector;

  if (!ruc?.trim()) {
    errors.push('RUC is required');
  }

  if (!correo?.trim()) {
    errors.push('Email is required');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim())) {
    errors.push('Invalid email format');
  }

  if (!nombre_contacto?.trim()) {
    errors.push('Contact name is required');
  }

  if (!telefono?.trim()) {
    errors.push('Phone is required');
  }

  if (!pais?.trim()) {
    errors.push('Country is required');
  }

  if (!nombre_organizacion?.trim()) {
    errors.push('Organization name is required');
  }

  if (!sector?.trim()) {
    errors.push('Sector is required');
  }

  // Validar organizationSize
  const tamano_organizacion = normalRow.tamano_organizacion;
  const organizationSize =
    tamano_organizacion?.toUpperCase() as OrganizationSize;
  if (!tamano_organizacion?.trim()) {
    errors.push('Organization size is required');
  } else if (!enums.OrganizationSize.includes(organizationSize)) {
    errors.push(`Invalid organization size: '${tamano_organizacion}'`);
  }

  // Validar topics de interés
  const temas_interes = normalRow.temas_interes;
  const topics = temas_interes
    ?.split(',')
    .map((t) => t.trim().toUpperCase() as TopicCode)
    .filter((t) => t);
  const invalidTopics =
    topics?.filter((t) => !enums.TopicCode.includes(t)) || [];
  if (invalidTopics.length > 0) {
    errors.push(`Invalid topic codes: ${invalidTopics.join(', ')}`);
  }

  const dto: CreateOrganizationDto = {
    ruc: ruc?.trim(),
    email: correo?.trim(),
    contactName: nombre_contacto?.trim(),
    phone: telefono?.trim(),
    country: pais?.trim(),
    organizationName: nombre_organizacion?.trim(),
    organizationSize,
    sector: sector?.trim(),
    topicsOfInterest: topics || [],
  };

  let filterDto: CreateOrganizationFilterDto | undefined = undefined;

  if (validateFilter) {
    // Validar majors
    const carreras = normalRow.carreras;
    const majors = (carreras ?? '')
      .split(',')
      .map((m) => m.trim().toUpperCase() as Major)
      .filter((m) => m);
    const invalidMajors = majors.filter((m) => !enums.Major.includes(m));
    if (invalidMajors.length > 0) {
      errors.push(`Invalid majors: ${invalidMajors.join(', ')}`);
    }

    // Validar departamentos
    const departamentos_de_residencia = normalRow.departamentos_de_residencia;
    const departments = (departamentos_de_residencia ?? '')
      .split(',')
      .map((d) => d.trim().toUpperCase() as PeruDepartment)
      .filter((d) => d);
    const invalidDepartments = departments.filter(
      (d) => !enums.PeruDepartment.includes(d),
    );
    if (invalidDepartments.length > 0) {
      errors.push(`Invalid Peru departments: ${invalidDepartments.join(', ')}`);
    }

    // Validar gender filter
    const genero_preferido = normalRow.genero_preferido;
    const genderFilter = genero_preferido?.toUpperCase() as GenderSelection;
    if (!genero_preferido?.trim()) {
      errors.push('Gender preference is required');
    } else if (!enums.GenderSelection.includes(genderFilter)) {
      errors.push(`Invalid gender filter: '${genero_preferido}'`);
    }

    // Validar max interns
    const max_internos = normalRow.max_internos;
    const maxInternsStr = max_internos?.trim();
    if (!maxInternsStr) {
      errors.push('Maximum number of interns is required');
    } else {
      const maxInterns = parseInt(maxInternsStr);
      if (isNaN(maxInterns) || maxInterns < 1) {
        errors.push('Maximum number of interns must be a positive number');
      } else {
        const requisitos_extra = normalRow.requisitos_extra;
        filterDto = {
          maximumNumberOfInterns: maxInterns,
          studiedMajorFilter: majors,
          placeOfResidenceFilter: departments,
          genderFilter,
          extraRequirements: requisitos_extra?.trim() || undefined,
        };
      }
    }
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

    // Extraer valores directamente del objeto raw usando Object.entries
    const entries = Object.entries(raw);
    const normalRow: Record<string, string> = {};

    // Crear un objeto normal con todas las propiedades
    for (const [key, value] of entries) {
      normalRow[key.trim()] = value as string; // Trim para eliminar espacios
    }

    // Extraer valores específicos
    const rucValue = normalRow.ruc;
    const emailValue = normalRow.correo;

    // Validar que el objeto raw tenga las propiedades necesarias
    if (!raw || typeof raw !== 'object') {
      results.push({
        dto: null,
        errors: ['Invalid row data'],
        row: i + 2,
      });
      continue;
    }

    if (!rucValue || rucValue.trim() === '') {
      results.push({
        dto: null,
        errors: ['Missing RUC field'],
        row: i + 2,
      });
      continue;
    }

    const [dto, errors] = mapRawToDto(
      normalRow as unknown as RawOrganizationCsvRow,
      validateFilter,
    );

    const ruc = rucValue.trim();
    if (seenRucs.has(ruc)) {
      const prevRow = seenRucs.get(ruc)! + 2;
      errors.push(`Duplicate RUC in CSV (also in row ${prevRow})`);
    } else {
      seenRucs.set(ruc, i);
    }

    const email = emailValue?.trim().toLowerCase();
    if (email) {
      if (seenEmails.has(email)) {
        const prevRow = seenEmails.get(email)! + 2;
        errors.push(`Duplicate email in CSV (also in row ${prevRow})`);
      } else {
        seenEmails.set(email, i);
      }
    }

    results.push({
      dto,
      errors,
      row: i + 2,
    });
  }

  return results;
}
