import { IsOptional, IsEnum, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { EShipmentStatus } from '../interfaces/shipment.interface';

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
    @IsEnum(EShipmentStatus)
    status?: EShipmentStatus;

    @IsOptional()
    @IsString()
    customerName?: string;
}
