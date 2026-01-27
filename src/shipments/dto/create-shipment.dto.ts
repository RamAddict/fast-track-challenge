import { IsString, IsNotEmpty, IsEnum, IsOptional, MaxLength } from 'class-validator';
import { EShipmentStatus } from '../interfaces/shipment.interface';

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

    @IsEnum(EShipmentStatus)
    @IsOptional()
    status?: EShipmentStatus;
}