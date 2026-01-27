import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { ShipmentsRepository } from './repository/shipments.repository';

@Injectable()
export class ShipmentsService {
    constructor(
        private readonly logger: PinoLogger,
        private readonly repository: ShipmentsRepository,
    ) {
        this.logger.setContext(ShipmentsService.name);
    }

    async create(dto: CreateShipmentDto) {
        this.logger.info(`Creating new shipment for order: ${dto.orderId}`);
        return this.repository.create({
            ...dto,
            status: dto.status ?? 'pending',
        });
    }

    async findAll() {
        return this.repository.findAll();
    }

    async findOne(id: string) {
        return this.repository.findById(id);
    }
}
