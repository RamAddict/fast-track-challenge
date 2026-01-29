import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { CarrierService } from './carrier.service';
import { CarrierProcessor } from './carrier.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'carrier-api',
      defaultJobOptions: {
        attempts: 5,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
        removeOnComplete: {
          age: 3600, // Keep completed jobs for 1 hour
          count: 1000, // Keep last 1000 completed jobs
        },
        removeOnFail: {
          age: 86400, // Keep failed jobs for 24 hours
        },
      },
    }),
  ],
  providers: [CarrierService, CarrierProcessor],
  exports: [CarrierService],
})
export class CarrierModule {}
