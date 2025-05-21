import { Test, TestingModule } from '@nestjs/testing';
import { ClientValidator } from '../../clients/validators';
import { CreateSalesService } from './create-sales.service';
import { LogService } from '../../common/utils';
import { OriginSalesEnum } from '../../../contracts/enums';
import { PubSubSalesService } from './pub-sub-sales.service';

jest.mock('../../common/provider/handle-error.provider', () => ({
  throwError: jest.fn((error) => {
    throw { type: error };
  }),
  ErrorsTypeEnum: {
    ClientNotFound: 'ClientNotFound',
  },
}));

describe(PubSubSalesService.name, () => {
  let service: PubSubSalesService;
  const clientValidator = { checkId: jest.fn() };
  const createSalesService = { enqueue: jest.fn() };
  const log = { PubSub: { Received: jest.fn(), Enqueued: jest.fn(), Error: jest.fn() } };
  const logService = { log: () => log };

  const mockMessage = (data: object) => {
    return {
      data: Buffer.from(JSON.stringify(data)),
      ack: jest.fn(),
    };
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PubSubSalesService,
        { provide: ClientValidator, useValue: clientValidator },
        { provide: CreateSalesService, useValue: createSalesService },
        { provide: LogService, useValue: logService },
      ],
    }).compile();

    service = module.get<PubSubSalesService>(PubSubSalesService);
  });

  it('should process and enqueue valid message', async () => {
    //Arrange
    const payload = { clientId: '123', saleDate: new Date().toISOString() };
    const message = mockMessage({ type: 'NEW_SALE', payload });
    clientValidator.checkId.mockResolvedValue(true);

    // Act
    const result = await service.processMessage(message as any);

    // Assert
    expect(log.PubSub.Received).toHaveBeenCalled();
    expect(clientValidator.checkId).toHaveBeenCalledWith('123');
    expect(createSalesService.enqueue).toHaveBeenCalledWith({
      ...payload,
      origin: OriginSalesEnum.PUBSUB,
    });
    expect(log.PubSub.Enqueued).toHaveBeenCalled();
    expect(message.ack).toHaveBeenCalled();
    expect(result).toBe(true);
  });

  it('should ack and return false when client is not found', async () => {
    //Arrange
    const payload = { clientId: 'not-found', saleDate: new Date().toISOString() };
    const message = mockMessage({ type: 'NEW_SALE', payload });
    clientValidator.checkId.mockResolvedValue(false);

    // Act
    const result = await service.processMessage(message as any);
    
    // Assert
    expect(clientValidator.checkId).toHaveBeenCalledWith('not-found');
    expect(message.ack).toHaveBeenCalled();
    expect(result).toBe(false);
    expect(log.PubSub.Error).toHaveBeenCalled();
  });

  it('should ack and return false on exception thrown in enqueue', async () => {
    //Arrange
    const payload = { clientId: '123', saleDate: new Date().toISOString() };
    const message = mockMessage({ type: 'NEW_SALE', payload });
    clientValidator.checkId.mockResolvedValue(true);
    createSalesService.enqueue.mockRejectedValue(new Error('fail'));

    // Act
    const result = await service.processMessage(message as any);

    // Assert
    expect(log.PubSub.Error).toHaveBeenCalledWith('fail', expect.any(Error));
    expect(message.ack).toHaveBeenCalled();
    expect(result).toBe(false);
  });
});
