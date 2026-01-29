import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PinoLogger } from 'nestjs-pino';
import { CarrierShipmentData } from './interfaces/carrier.interface';
import { CarrierJobData } from './interfaces/carrier-job.interface';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CarrierService {
  private readonly baseUrl: string;

  constructor(
    @InjectQueue('carrier-api') private readonly carrierQueue: Queue,
    private readonly logger: PinoLogger,
    private readonly configService: ConfigService,
  ) {
    this.logger.setContext(CarrierService.name);
    this.baseUrl = this.configService.getOrThrow<string>('CARRIER_SERVICE_URL');
  }

  /**
   * Register a shipment with the carrier API (queued with automatic retry)
   */
  async registerShipment(data: CarrierShipmentData): Promise<any> {
    this.logger.info(
      `Queueing shipment ${data.id} for carrier registration...`,
    );

    try {
      // Check if shipment already exists
      const exists = await this.checkShipmentExists(data.id);

      if (exists) {
        this.logger.info(
          `Shipment ${data.id} already exists in carrier. Queueing update...`,
        );
        return this.updateShipment(data.id, data);
      }

      // Add job to queue with exponential backoff
      const job = await this.carrierQueue.add(
        'register-shipment',
        {
          shipmentId: data.id,
          orderId: data.orderId,
          customerName: data.customerName,
          destination: data.destination,
          status: data.status,
          operation: 'register',
        } as CarrierJobData,
        {
          jobId: `register-${data.id}`, // Prevent duplicate jobs
          removeOnComplete: true,
        },
      );

      this.logger.info(
        `Shipment ${data.id} queued for registration (Job ID: ${job.id})`,
      );

      // Return job info instead of waiting for completion
      return {
        jobId: job.id,
        shipmentId: data.id,
        status: 'queued',
      };
    } catch (error) {
      this.logger.error(
        error,
        `Failed to queue shipment ${data.id} for carrier registration`,
      );
      // Graceful degradation - allow local creation even if queueing fails
      return null;
    }
  }

  /**
   * Update a shipment with the carrier API (queued with automatic retry)
   */
  async updateShipment(
    id: string,
    data: Partial<CarrierShipmentData>,
  ): Promise<any> {
    this.logger.info(`Queueing shipment ${id} for carrier update...`);

    try {
      const job = await this.carrierQueue.add(
        'update-shipment',
        {
          shipmentId: id,
          orderId: data.orderId,
          customerName: data.customerName,
          destination: data.destination,
          status: data.status,
          operation: 'update',
        } as CarrierJobData,
        {
          jobId: `update-${id}`, // Prevent duplicate jobs
          removeOnComplete: true,
        },
      );

      this.logger.info(`Shipment ${id} queued for update (Job ID: ${job.id})`);

      return {
        jobId: job.id,
        shipmentId: id,
        status: 'queued',
      };
    } catch (error) {
      this.logger.error(
        error,
        `Failed to queue shipment ${id} for carrier update`,
      );
      throw error;
    }
  }

  /**
   * Get shipment status from carrier API (direct call, no queue)
   */
  async getShipmentStatus(id: string): Promise<any> {
    try {
      const response = await fetch(this.getShipmentUrl(id));
      if (response.status === 404) return null;
      if (!response.ok)
        throw new Error(`Carrier API error: ${response.statusText}`);
      return response.json();
    } catch (error) {
      this.logger.error(error, `Failed to get shipment status for ${id}`);
      throw error;
    }
  }

  /**
   * Check if shipment exists in carrier system
   */
  private async checkShipmentExists(id: string): Promise<boolean> {
    try {
      const response = await fetch(this.getShipmentUrl(id));
      return response.ok;
    } catch {
      return false;
    }
  }

  private getShipmentUrl(id?: string): string {
    return id ? `${this.baseUrl}/shipments/${id}` : `${this.baseUrl}/shipments`;
  }
}
