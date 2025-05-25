import { Company as CompanyModel } from '@prisma/client';

export class Company {
    constructor(
        public readonly id: string,
        public name: string,
        public readonly createdAt: Date,
        public readonly updatedAt: Date,
    ) { }

    static fromPrisma(data: CompanyModel): Company {
        return new Company(data.id, data.name, data.createdAt, data.updatedAt);
    }
}
