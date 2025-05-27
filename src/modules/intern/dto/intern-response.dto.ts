import { Expose, plainToInstance } from 'class-transformer';
import { Intern } from '../entities/intern.entity';

export class InternResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  lastName: string;

  @Expose()
  document: string;

  @Expose()
  gender: string;

  @Expose()
  birthdate: Date;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  static fromEntity(entity: Intern): InternResponseDto {
    return plainToInstance(InternResponseDto, entity, {
      excludeExtraneousValues: true,
    });
  }
}
