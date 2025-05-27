import { Expose, plainToInstance } from 'class-transformer';
import { Company } from '../entities/company.entity';

export class CompanyResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  static fromEntity(entity: Company): CompanyResponseDto {
    return plainToInstance(CompanyResponseDto, entity, {
      excludeExtraneousValues: true,
    });
  }
}
