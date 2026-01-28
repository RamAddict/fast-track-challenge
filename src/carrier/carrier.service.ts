import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PinoLogger } from 'nestjs-pino';
import { CarrierShipmentData } from './interfaces/carrier.interface';

@Injectable()
export class CarrierService {
  private readonly baseUrl: string;

  constructor(
    private readonly logger: PinoLogger,
    private readonly configService: ConfigService,
  ) {
    this.logger.setContext(CarrierService.name);
    this.baseUrl = this.configService.getOrThrow<string>('CARRIER_SERVICE_URL');
  }

  async registerShipment(data: CarrierShipmentData): Promise<any> {
    this.logger.info(`Registering shipment ${data.id} with carrier...`);

    try {
      const exists = await this.checkShipmentExists(data.id);

      if (exists) {
        this.logger.info(
          `Shipment ${data.id} already exists in carrier. Updating...`,
        );
        return this.updateShipment(data.id, data);
      }

      const result = await this.withRetry(async () => {
        const response = await fetch(this.getShipmentUrl(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error(`Carrier API error: ${response.statusText}`);
        }

        return response.json();
      });

      this.logger.info(
        `Successfully registered shipment ${data.id} with carrier.`,
      );
      return result;
    } catch (error) {
      this.logger.error(
        error,
        `Failed to register shipment ${data.id} with carrier`,
      );
      // We don't rethrow here if we want to allow local creation even if carrier fails (graceful degradation)
      return null;
    }
  }

  async updateShipment(
    id: string,
    data: Partial<CarrierShipmentData>,
  ): Promise<any> {
    return this.withRetry(async () => {
      const response = await fetch(this.getShipmentUrl(id), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to update shipment ${id}: ${response.statusText}`,
        );
      }

      return response.json();
    });
  }

  async getShipmentStatus(id: string): Promise<any> {
    const response = await fetch(this.getShipmentUrl(id));
    if (response.status === 404) return null;
    if (!response.ok)
      throw new Error(`Carrier API error: ${response.statusText}`);
    return response.json();
  }

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

  private async withRetry<T>(
    operation: () => Promise<T>,
    attempt = 1,
    maxRetries = 3,
    delay = 1000,
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (attempt > maxRetries) {
        throw error;
      }

      this.logger.warn(
        `Carrier API call failed (Attempt ${attempt}/${maxRetries}). Retrying in ${delay}ms... Error: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );

      await new Promise((resolve) => setTimeout(resolve, delay));
      return this.withRetry(
        operation,
        attempt + 1,
        maxRetries,
        // double delay and add jitter (random delay between 0 and 300ms)
        delay * 2 + Math.floor(Math.random() * 300),
      );
    }
  }
}
