import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { QueryShipmentsDto } from './dto/query-shipments.dto';
import { ShipmentsRepository } from './repository/shipments.repository';
import { IPaginatedShipments } from './interfaces/paginated-response.interface';
import { EShipmentStatus } from './interfaces/shipment.interface';

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

    this.logger.info(
      `Fetching shipments - page: ${page}, limit: ${limit}, status: ${status || 'all'}, customerName: ${customerName || 'all'}`,
    );

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

  async syncWithCarrier() {
    this.logger.info('Starting manual synchronization with carrier API');
    const shipments = await this.repository.getAllShipments();

    let updatedCount = 0;
    let failedCount = 0;

    for (const shipment of shipments) {
      try {
        const response = await fetch(
          `http://localhost:3001/carrier/shipments/${shipment.id}`,
        );

        if (!response.ok) {
          this.logger.warn(
            `Failed to fetch status for shipment ${shipment.id}: ${response.statusText}`,
          );
          failedCount++;
          continue;
        }

        const data = (await response.json()) as any;

        if (data.status && data.status !== shipment.status) {
          this.logger.info(
            `Updating shipment ${shipment.id} status from ${shipment.status} to ${data.status}`,
          );
          await this.repository.updateStatus(
            shipment.id,
            data.status as EShipmentStatus,
            new Date(),
          );
          updatedCount++;
        }
      } catch (error) {
        this.logger.error(error, `Error syncing shipment ${shipment.id}`);
        failedCount++;
      }
    }

    return {
      total: shipments.length,
      updated: updatedCount,
      failed: failedCount,
      timestamp: new Date(),
    };
  }
}
