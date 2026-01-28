import { IsOptional, IsEnum, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { SHIPMENT_STATUS } from '../interfaces/shipment.interface';
import type { EShipmentStatus } from '../interfaces/shipment.interface';

export class QueryShipmentsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @IsOptional()
  @IsEnum(SHIPMENT_STATUS)
  status?: EShipmentStatus;

  @IsOptional()
  @IsString()
  customerName?: string;
}
