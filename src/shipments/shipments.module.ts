import { Module } from '@nestjs/common';
import { ShipmentsController } from './shipments.controller';
import { SyncController } from '../sync.controller';
import { ShipmentsService } from './shipments.service';
import { ShipmentsRepository } from './repository/shipments.repository';
import { CarrierService } from '../carrier/carrier.service';
import { DatabaseModule } from 'src/db/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [ShipmentsController, SyncController],
  providers: [ShipmentsService, ShipmentsRepository, CarrierService],
})
export class ShipmentsModule {}
