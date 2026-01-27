import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { QueryShipmentsDto } from './dto/query-shipments.dto';
import { ShipmentsRepository } from './repository/shipments.repository';
import { IPaginatedShipments } from './interfaces/paginated-response.interface';

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

    async findAll(query: QueryShipmentsDto): Promise<IPaginatedShipments> {
        const { page = 1, limit = 10, status, customerName } = query;

        this.logger.info(`Fetching shipments - page: ${page}, limit: ${limit}, status: ${status || 'all'}, customerName: ${customerName || 'all'}`);

        const { data, total } = await this.repository.findAll({
            page,
            limit,
            status,
            customerName,
        });

        const totalPages = Math.ceil(total / limit);

        return {
            data,
            meta: {
                total,
                page,
                limit,
                totalPages,
            },
        };
    }

    async findOne(id: string) {
        return this.repository.findById(id);
    }
}
