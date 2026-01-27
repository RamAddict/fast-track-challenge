import { Module } from '@nestjs/common';
import { ShipmentsController } from './shipments.controller';
import { ShipmentsService } from './shipments.service';
import { ShipmentsRepository } from './repository/shipments.repository';
import { DatabaseModule } from '../db/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [ShipmentsController],
  providers: [ShipmentsService, ShipmentsRepository]
})
export class ShipmentsModule { }
