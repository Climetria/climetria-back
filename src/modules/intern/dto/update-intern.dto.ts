import { CreateInternDto } from './create-intern.dto';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateInternDto extends PartialType(CreateInternDto) {}
