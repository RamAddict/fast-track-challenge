import { Test, TestingModule } from '@nestjs/testing';
import { ShipmentsService } from './shipments.service';
import { PinoLogger } from 'nestjs-pino';
import { ShipmentsRepository } from './repository/shipments.repository';
import { CarrierService } from '../carrier/carrier.service';
import { CreateShipmentDto } from './dto/create-shipment.dto';

describe('ShipmentsService', () => {
  let service: ShipmentsService;
  let repository: ShipmentsRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShipmentsService,
        {
          provide: PinoLogger,
          useValue: {
            setContext: jest.fn(),
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
            debug: jest.fn(),
          },
        },
        {
          provide: ShipmentsRepository,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findById: jest.fn(),
            getAllShipments: jest.fn(),
            updateStatusByOrderId: jest.fn(),
          },
        },
        {
          provide: CarrierService,
          useValue: {
            registerShipment: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ShipmentsService>(ShipmentsService);
    repository = module.get<ShipmentsRepository>(ShipmentsRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a shipment equal to the shipment passed ', async () => {
    const shipment = {
      orderId: '1',
      customerName: 'John Doe',
      destination: 'mars',
      status: 'pending',
    };

    jest.spyOn(repository, 'create').mockResolvedValue([shipment] as any);

    await expect(
      service.create(shipment as CreateShipmentDto),
    ).resolves.toEqual(shipment);
  });
});
