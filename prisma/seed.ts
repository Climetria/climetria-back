// Datos ficticios para desarrollo local.
// Uso: npx ts-node prisma/seed.ts   (borra todo y vuelve a cargar)
import {
  Attendance,
  DocumentType,
  Gender,
  GenderSelection,
  Major,
  OrganizationSize,
  PeruDepartment,
  PrismaClient,
  TopicCode,
} from '@prisma/client';

const prisma = new PrismaClient();

const firstNames = [
  'Lucía',
  'Mateo',
  'Valeria',
  'Diego',
  'Camila',
  'Sebastián',
  'Daniela',
  'Andrés',
  'Mariana',
  'Joaquín',
  'Fernanda',
  'Rodrigo',
  'Ximena',
  'Gonzalo',
  'Paola',
  'Renato',
  'Alessandra',
  'Bruno',
  'Carla',
  'Iván',
];
const lastNames = [
  'Quispe',
  'Flores',
  'Rojas',
  'Huamán',
  'Mendoza',
  'Vargas',
  'Castillo',
  'Chávez',
  'Ramírez',
  'Torres',
  'Salazar',
  'Paredes',
  'Gutiérrez',
  'Cárdenas',
  'Espinoza',
  'Ríos',
];
const universities = [
  'UNALM',
  'PUCP',
  'UNMSM',
  'UPCH',
  'UNSA',
  'UNSAAC',
  'UNI',
  'Universidad de Lima',
];
const departments: PeruDepartment[] = [
  'LIMA_METROPOLITANA',
  'AREQUIPA',
  'CUSCO',
  'PIURA',
  'JUNIN',
  'LA_LIBERTAD',
  'LAMBAYEQUE',
  'ICA',
];
const majors: Major[] = [
  'Ingenieria_Ambiental',
  'Ingenieria_Forestal',
  'Biologia',
  'Gestion_Ambiental',
  'Otras',
];
const genders: Gender[] = [
  'Femenino',
  'Masculino',
  'Femenino',
  'Masculino',
  'Prefiero_No_Decirlo',
];
const topics: TopicCode[] = ['HC', 'HH', 'CN'];
const attendance: Attendance[] = ['A', 'A', 'A', 'T', 'F', 'FJ'];

const pick = <T>(list: T[], i: number) => list[i % list.length];
const logo = (text: string) =>
  `https://placehold.co/240x96/png?text=${encodeURIComponent(text)}`;
const signature = (text: string) =>
  `https://placehold.co/240x80/png?text=${encodeURIComponent(text)}&font=playfair-display`;

async function reset() {
  await prisma.grade.deleteMany();
  await prisma.internAssignment.deleteMany();
  await prisma.mentorAssignment.deleteMany();
  await prisma.organizationCertificateCourse.deleteMany();
  await prisma.organizationCertificate.deleteMany();
  await prisma.internCourse.deleteMany();
  await prisma.mentorCourse.deleteMany();
  await prisma.organizationCourse.deleteMany();
  await prisma.intern.deleteMany();
  await prisma.mentor.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.course.deleteMany();
  await prisma.user.deleteMany();
}

async function main() {
  await reset();

  const courses = await Promise.all([
    prisma.course.create({
      data: {
        name: 'Programa de Huella de Carbono 2026-II',
        description: 'Medición de huella de carbono en organizaciones peruanas',
        startDate: new Date('2026-08-03'),
        endDate: new Date('2026-12-18'),
      },
    }),
    prisma.course.create({
      data: {
        name: 'Programa de Huella Hídrica 2026-I',
        description: 'Gestión responsable del agua y huella hídrica',
        startDate: new Date('2026-03-02'),
        endDate: new Date('2026-07-17'),
      },
    }),
  ]);

  await prisma.user.createMany({
    data: [
      { email: 'dev-admin@local.test', Role: 'ADMIN' },
      { email: 'dev-mentor@local.test', Role: 'MENTOR' },
    ],
  });

  // El primer mentor coincide con el usuario "Entrar como mentor" del front (authUserId = dev-mentor)
  const mentorSeeds = [
    {
      firstNames: 'Dev',
      lastNameFather: 'Mentor',
      lastNameMother: 'Local',
      email: 'dev-mentor@local.test',
      authUserId: 'dev-mentor',
    },
    {
      firstNames: 'Rosa',
      lastNameFather: 'Alvarado',
      lastNameMother: 'Pinto',
      email: 'rosa.alvarado@example.com',
      authUserId: 'mentor-2',
    },
    {
      firstNames: 'Jorge',
      lastNameFather: 'Medina',
      lastNameMother: 'Soto',
      email: 'jorge.medina@example.com',
      authUserId: 'mentor-3',
    },
    {
      firstNames: 'Elena',
      lastNameFather: 'Ccahuana',
      lastNameMother: 'Ruiz',
      email: 'elena.ccahuana@example.com',
      authUserId: 'mentor-4',
    },
  ];
  const mentors = await Promise.all(
    mentorSeeds.map((m, i) =>
      prisma.mentor.create({
        data: {
          ...m,
          documentType: DocumentType.DNI,
          document: `4${String(1000000 + i).padStart(7, '0')}`,
          phone: `9${String(87654320 + i)}`,
          country: 'Perú',
          peruDepartment: pick(departments, i),
        },
      }),
    ),
  );

  const orgSeeds = [
    {
      organizationName: 'Andina Foods S.A.C.',
      sector: 'Alimentos',
      organizationSize: OrganizationSize.LARGE,
    },
    {
      organizationName: 'Minera Horizonte S.A.',
      sector: 'Minería',
      organizationSize: OrganizationSize.LARGE,
    },
    {
      organizationName: 'EcoTextil Perú',
      sector: 'Textil',
      organizationSize: OrganizationSize.SMALL,
    },
    {
      organizationName: 'Café Selva Alta',
      sector: 'Agroindustria',
      organizationSize: OrganizationSize.SMALL,
    },
    {
      organizationName: 'Constructora Pacífico',
      sector: 'Construcción',
      organizationSize: OrganizationSize.LARGE,
    },
  ];
  const organizations = await Promise.all(
    orgSeeds.map((o, i) =>
      prisma.organization.create({
        data: {
          ...o,
          ruc: `20${String(500000000 + i * 7919).padStart(9, '0')}`,
          email: `contacto${i + 1}@example.com`,
          contactName: `${pick(firstNames, i + 3)} ${pick(lastNames, i + 5)}`,
          phone: `01${String(4400000 + i)}`,
          country: 'Perú',
          topicsOfInterest: i % 2 === 0 ? ['HC', 'CN'] : ['HH'],
          logoUrl: logo(o.organizationName),
          signerFullName: `${pick(firstNames, i + 7)} ${pick(lastNames, i + 2)}`,
          signerTitle: 'Gerente de Sostenibilidad',
          signerSignatureUrl: signature(pick(lastNames, i + 2)),
        },
      }),
    ),
  );

  const interns = await Promise.all(
    Array.from({ length: 20 }, (_, i) =>
      prisma.intern.create({
        data: {
          documentType: i % 7 === 6 ? DocumentType.CE : DocumentType.DNI,
          document: `7${String(2000000 + i).padStart(7, '0')}`,
          email: `practicante${i + 1}@example.com`,
          firstNames: pick(firstNames, i),
          lastNameFather: pick(lastNames, i),
          lastNameMother: pick(lastNames, i + 7),
          gender: pick(genders, i),
          phone: `9${String(76543210 + i)}`,
          universityName: pick(universities, i),
          majorInProgress: pick(majors, i),
          otherMajor:
            pick(majors, i) === 'Otras' ? 'Ingeniería Industrial' : null,
          graduationYear: 2025 + (i % 3),
          referralSource: pick(
            ['LinkedIn', 'Universidad', 'Instagram', 'Un amigo'],
            i,
          ),
          topicsOfInterest: [pick(topics, i), pick(topics, i + 1)],
          country: 'Perú',
          peruDepartment: pick(departments, i),
        },
      }),
    ),
  );

  for (const [c, course] of courses.entries()) {
    const courseOrgs = c === 0 ? organizations : organizations.slice(0, 3);
    const courseMentors = c === 0 ? mentors : mentors.slice(1, 3);
    const courseInterns = c === 0 ? interns.slice(0, 14) : interns.slice(10);

    await prisma.organizationCourse.createMany({
      data: courseOrgs.map((o, i) => ({
        organizationId: o.id,
        courseId: course.id,
        maximumNumberOfInterns: 3 + (i % 3),
        placeOfResidenceFilter:
          i % 2 === 0 ? ['LIMA_METROPOLITANA', 'CALLAO'] : [],
        studiedMajorFilter:
          i % 2 === 0 ? ['Ingenieria_Ambiental', 'Gestion_Ambiental'] : [],
        genderFilter: GenderSelection.Ambos,
      })),
    });
    await prisma.mentorCourse.createMany({
      data: courseMentors.map((m) => ({ mentorId: m.id, courseId: course.id })),
    });
    await prisma.internCourse.createMany({
      data: courseInterns.map((n) => ({ internId: n.id, courseId: course.id })),
    });

    // Cada organización recibe un mentor; los practicantes se reparten entre organizaciones
    await prisma.mentorAssignment.createMany({
      data: courseOrgs.map((o, i) => ({
        mentorId: pick(courseMentors, i).id,
        organizationId: o.id,
        courseId: course.id,
      })),
    });
    // Deja 2 practicantes sin asignar para ver ese estado en la UI
    const assigned = courseInterns.slice(0, -2);
    await prisma.internAssignment.createMany({
      data: assigned.map((n, i) => ({
        internId: n.id,
        organizationId: pick(courseOrgs, i).id,
        courseId: course.id,
      })),
    });

    const finished = c === 1;
    await prisma.grade.createMany({
      data: assigned.map((n, i) => {
        const orgIndex = i % courseOrgs.length;
        const score = (offset: number) => 1 + ((i + offset) % 5);
        const progress = finished ? 6 : 3 + (i % 3);
        const session = (s: number) =>
          s <= progress ? pick(attendance, i + s) : null;
        return {
          internId: n.id,
          courseId: course.id,
          organizationId: courseOrgs[orgIndex].id,
          mentorId: pick(courseMentors, orgIndex).id,
          s1: session(1),
          s2: session(2),
          s3: session(3),
          s4: session(4),
          s5: session(5),
          s6: session(6),
          initialCommitment: score(1),
          assertiveCommunication: score(2),
          punctuality: score(3),
          classParticipation: score(4),
          proactivity: finished || i % 2 === 0 ? score(5) : null,
          communicationSkills: finished ? score(6) : null,
          punctualityOfDelivery: finished ? score(7) : null,
          redaction: finished ? score(8) : null,
          performance: finished ? score(9) : null,
          recommendation: finished
            ? 'Muy buen desempeño, recomendable para proyectos de sostenibilidad.'
            : null,
          finalReportCheck: finished,
          talkCheck: finished && i % 4 !== 0,
          recommendationCheck: finished,
        };
      }),
    });
  }

  const certificate = await prisma.organizationCertificate.create({
    data: {
      name: 'Climetria',
      logoUrl: logo('Climetria'),
      signerFullName: 'Ana Torres Salazar',
      signerTitle: 'Directora de Programas',
      signerSignatureUrl: signature('Torres'),
    },
  });
  await prisma.organizationCertificateCourse.createMany({
    data: courses.map((c) => ({
      orgCertificateId: certificate.id,
      courseId: c.id,
    })),
  });

  console.log(
    `Listo: ${courses.length} cursos, ${mentors.length} mentores, ${organizations.length} organizaciones, ${interns.length} practicantes`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => void prisma.$disconnect());
