import { Controller, Post } from '@nestjs/common';
import { ShipmentsService } from './shipments/shipments.service';

@Controller('sync')
export class SyncController {
  constructor(private readonly shipmentsService: ShipmentsService) {}

  @Post()
  sync() {
    return this.shipmentsService.syncWithCarrier();
  }
}
