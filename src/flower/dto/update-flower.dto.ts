// dto/update-flower.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateFlowerDto } from './createflower.dto';

export class UpdateFlowerDto extends PartialType(CreateFlowerDto) {}
