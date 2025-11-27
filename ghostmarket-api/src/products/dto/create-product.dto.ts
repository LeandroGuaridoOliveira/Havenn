import { IsNotEmpty, IsString, IsNumber, IsOptional, IsUrl, ValidateNested, IsArray, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateLessonDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsUrl()
  videoUrl: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsInt()
  order: number;
}

export class CreateModuleDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsInt()
  order: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateLessonDto)
  lessons: CreateLessonDto[];
}

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  details?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsUrl()
  videoUrl?: string;

  @IsNotEmpty()
  @IsNumber()
  price: number;

  @IsOptional()
  @IsString()
  storageKey?: string;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateModuleDto)
  modules?: CreateModuleDto[];
}