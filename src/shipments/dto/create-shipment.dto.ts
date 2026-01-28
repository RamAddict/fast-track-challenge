import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  MaxLength,
  IsBoolean,
} from 'class-validator';
import { SHIPMENT_STATUS } from '../interfaces/shipment.interface';
import type { EShipmentStatus } from '../interfaces/shipment.interface';

export class CreateShipmentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  orderId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  customerName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  destination: string;

  @IsEnum(SHIPMENT_STATUS)
  @IsOptional()
  status?: EShipmentStatus;

  @IsOptional()
  @IsBoolean()
  registerWithCarrier = false;
}
