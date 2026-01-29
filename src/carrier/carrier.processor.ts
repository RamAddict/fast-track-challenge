import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Job } from 'bullmq';
import { PinoLogger } from 'nestjs-pino';
import { CarrierJobData } from './interfaces/carrier-job.interface';
import { ConfigService } from '@nestjs/config';

@Injectable()
@Processor('carrier-api', {
  concurrency: 5, // Process up to 5 jobs concurrently
})
export class CarrierProcessor extends WorkerHost {
  private readonly baseUrl: string;
  private readonly requestTimeout: number;

  constructor(
    private readonly logger: PinoLogger,
    private readonly configService: ConfigService,
  ) {
    super();
    this.logger.setContext(CarrierProcessor.name);
    this.baseUrl = this.configService.getOrThrow<string>('CARRIER_SERVICE_URL');
    this.requestTimeout = this.configService.get<number>(
      'CARRIER_REQUEST_TIMEOUT',
      10000,
    );
  }

  async process(job: Job<CarrierJobData>): Promise<any> {
    const { shipmentId, operation } = job.data;

    this.logger.info(
      `Processing carrier API job: ${operation} for shipment ${shipmentId} (Attempt ${job.attemptsMade + 1})`,
    );

    try {
      if (operation === 'register') {
        return await this.registerShipment(job.data);
      } else if (operation === 'update') {
        return await this.updateShipment(job.data);
      }
    } catch (error) {
      this.logger.error(
        error,
        `Failed to ${operation} shipment ${shipmentId} with carrier API`,
      );

      // Check if this is a rate limit error (429)
      if (error instanceof Error && error.message.includes('429')) {
        // BullMQ will automatically retry based on backoff settings
        throw error;
      }

      // For other errors, also retry
      throw error;
    }
  }

  private async registerShipment(data: CarrierJobData): Promise<any> {
    const { shipmentId, orderId, customerName, destination, status } = data;

    const response = await this.fetchWithTimeout(`${this.baseUrl}/shipments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: shipmentId,
        orderId,
        customerName,
        destination,
        status,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Carrier API error (${response.status}): ${response.statusText}`,
      );
    }

    const result = await response.json();
    this.logger.info(`Successfully registered shipment ${shipmentId}`);
    return result;
  }

  private async updateShipment(data: CarrierJobData): Promise<any> {
    const { shipmentId, orderId, customerName, destination, status } = data;

    const response = await this.fetchWithTimeout(
      `${this.baseUrl}/shipments/${shipmentId}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          customerName,
          destination,
          status,
        }),
      },
    );

    if (!response.ok) {
      throw new Error(
        `Carrier API error (${response.status}): ${response.statusText}`,
      );
    }

    const result = await response.json();
    this.logger.info(`Successfully updated shipment ${shipmentId}`);
    return result;
  }

  private async fetchWithTimeout(
    url: string,
    options?: RequestInit,
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.requestTimeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Request timeout after ${this.requestTimeout}ms`);
      }
      throw error;
    }
  }
}
