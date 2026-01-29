import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PinoLogger } from 'nestjs-pino';
import { ShipmentsService } from './shipments.service';

@Injectable()
export class ShipmentsScheduler {
  constructor(
    private readonly logger: PinoLogger,
    private readonly shipmentsService: ShipmentsService,
  ) {
    this.logger.setContext(ShipmentsScheduler.name);
    this.logger.info(
      'Carrier sync scheduler initialized (runs every 5 minutes)',
    );
  }

  /**
   * Scheduled task to sync shipments with carrier API
   * Runs every 5 minutes
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleCarrierSync() {
    this.logger.info('Starting scheduled carrier synchronization');

    try {
      const result = await this.shipmentsService.syncWithCarrier();

      this.logger.info(
        {
          total: result.total,
          updated: result.updated,
          failed: result.failed,
          timestamp: result.timestamp,
        },
        'Scheduled carrier sync completed',
      );

      // Log warning if there were failures
      if (result.failed > 0) {
        this.logger.warn(
          `${result.failed} shipments failed to sync during scheduled sync`,
        );
      }
    } catch (error) {
      this.logger.error(
        { err: error },
        'Error during scheduled carrier synchronization',
      );
    }
  }
}
