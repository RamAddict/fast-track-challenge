import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { EShipmentStatus } from '../interfaces/shipment.interface';

export class CreateShipmentDto {
    @IsString()
    @IsNotEmpty()
    orderId: string;

    @IsString()
    @IsNotEmpty()
    customerName: string;

    @IsString()
    @IsNotEmpty()
    destination: string;

    @IsEnum(EShipmentStatus)
    @IsOptional()
    status?: EShipmentStatus;
}