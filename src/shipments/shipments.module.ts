import { Module } from '@nestjs/common';
import { ShipmentsController } from './shipments.controller';
import { SyncController } from '../sync.controller';
import { ShipmentsService } from './shipments.service';
import { ShipmentsRepository } from './repository/shipments.repository';
import { DatabaseModule } from '../db/database.module';
import { CarrierModule } from '../carrier/carrier.module';

@Module({
  imports: [DatabaseModule, CarrierModule],
  controllers: [ShipmentsController, SyncController],
  providers: [ShipmentsService, ShipmentsRepository],
})
export class ShipmentsModule {}
