import { Expose, plainToInstance } from 'class-transformer';
import { Mentor } from '../entities/mentor.entity';

export class MentorResponseDto {
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

  static fromEntity(entity: Mentor): MentorResponseDto {
    return plainToInstance(MentorResponseDto, entity, {
      excludeExtraneousValues: true,
    });
  }
}
