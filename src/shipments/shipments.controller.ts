import { Controller, Get, Post, Body, Param, ParseUUIDPipe } from '@nestjs/common';
import { ShipmentsService } from './shipments.service';
import { CreateShipmentDto } from './dto/create-shipment.dto';

@Controller('shipments')
export class ShipmentsController {
    constructor(private readonly shipmentsService: ShipmentsService) { }

    @Post()
    create(@Body() createShipmentDto: CreateShipmentDto) {
        return this.shipmentsService.create(createShipmentDto);
    }

    @Get()
    findAll() {
        return this.shipmentsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id', new ParseUUIDPipe()) id: string) {
        return this.shipmentsService.findOne(id);
    }
}