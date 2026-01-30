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

  it('should find all shipments', async () => {
    const shipments = [
      {
        orderId: '1',
        customerName: 'John Doe',
        destination: 'mars',
        status: 'pending',
      },
      {
        orderId: '2',
        customerName: 'Jane Doe',
        destination: 'venus',
        status: 'pending',
      },
    ];

    (repository.findAll as jest.Mock).mockResolvedValue({
      data: shipments,
      total: 2,
    });

    const expectedResult = {
      data: shipments,
      meta: {
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      },
    };

    await expect(service.findAll({ page: 1, limit: 10 })).resolves.toEqual(
      expectedResult,
    );
  });

  it('should find one shipment', async () => {
    const shipment = {
      orderId: '1',
      customerName: 'John Doe',
      destination: 'mars',
      status: 'pending',
    };

    (repository.findById as jest.Mock).mockResolvedValue(shipment);

    await expect(service.findOne('1')).resolves.toEqual(shipment);
  });

  it('should sync shipments with carrier (with no updates)', async () => {
    const shipments = [
      {
        orderId: '1',
        customerName: 'John Doe',
        destination: 'mars',
        status: 'pending',
      },
      {
        orderId: '2',
        customerName: 'Jane Doe',
        destination: 'venus',
        status: 'pending',
      },
    ];

    (repository.getAllShipments as jest.Mock).mockResolvedValue(shipments);

    // mock date to prevent test failure due to time difference
    const date = new Date();
    jest.spyOn(global, 'Date').mockImplementation(() => date as any);

    // mock carrier fetch
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        status: 'pending',
      }),
    });

    const expectedResult = {
      total: 2,
      updated: 0,
      failed: 0,
      timestamp: date,
    };

    await expect(service.syncWithCarrier()).resolves.toEqual(expectedResult);
  });

  it('should sync shipments with carrier (with updates)', async () => {
    const shipments = [
      {
        orderId: '1',
        customerName: 'John Doe',
        destination: 'mars',
        status: 'pending',
      },
      {
        orderId: '2',
        customerName: 'Jane Doe',
        destination: 'venus',
        status: 'pending',
      },
    ];

    (repository.getAllShipments as jest.Mock).mockResolvedValue(shipments);

    // mock date to prevent test failure due to time difference
    const date = new Date();
    jest.spyOn(global, 'Date').mockImplementation(() => date as any);

    // mock carrier fetch
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        status: 'in_transit',
      }),
    });

    const expectedResult = {
      total: 2,
      updated: 2,
      failed: 0,
      timestamp: date,
    };

    await expect(service.syncWithCarrier()).resolves.toEqual(expectedResult);
  });

  it('should sync shipments with carrier (with failures)', async () => {
    const shipments = [
      {
        orderId: '1',
        customerName: 'John Doe',
        destination: 'mars',
        status: 'pending',
      },
      {
        orderId: '2',
        customerName: 'Jane Doe',
        destination: 'venus',
        status: 'pending',
      },
    ];

    (repository.getAllShipments as jest.Mock).mockResolvedValue(shipments);

    // mock date to prevent test failure due to time difference
    const date = new Date();
    jest.spyOn(global, 'Date').mockImplementation(() => date as any);

    // mock carrier fetch
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: jest.fn().mockResolvedValue({
        status: 'in_transit',
      }),
    });

    const expectedResult = {
      total: 2,
      updated: 0,
      failed: 2,
      timestamp: date,
    };

    await expect(service.syncWithCarrier()).resolves.toEqual(expectedResult);
  });
});
