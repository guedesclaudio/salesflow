import { Test, TestingModule } from '@nestjs/testing';
import { ClientValidator } from './client.validator';
import { ClientTokensRepository } from '../repositories';
import { ErrorsTypeEnum } from '../../common/provider/handle-error.provider';
import { ClientTokens, ActivityStatus } from '@prisma/client';
import { PrismaService } from '../../common/provider/prisma.provider';
import { createMockPrisma } from '../../test/mocks';
import { createClientTokenFactory } from '../../test/factories';

jest.mock('../../common/provider/handle-error.provider', () => ({
  throwError: jest.fn((error) => {
    throw { type: error };
  }),
  ErrorsTypeEnum: {
    ClientNotFound: 'ClientNotFound',
  },
}));

describe(ClientValidator.name, () => {
  let service: ClientValidator;
  let prisma: ReturnType<typeof createMockPrisma>;

  beforeEach(async () => {
    prisma = createMockPrisma();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaService,
        ClientTokensRepository,
        ClientValidator,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<ClientValidator>(ClientValidator);
  });

  describe('checkAccessToken', () => {
    it('should return client when access token is valid', async () => {
      // Arrange
      const mockToken = 'valid-token';
      const mockClient = createClientTokenFactory({
        accessToken: mockToken,
        activityStatus: ActivityStatus.ACTIVE,
      });
      prisma.clientTokens.findFirst = jest.fn().mockResolvedValue(mockClient);

      // Act
      const result = await service.checkAccessToken(mockToken);

      // Assert
      expect(result).toBe(mockClient);
      expect(prisma.clientTokens.findFirst).toHaveBeenCalledWith({
        where: {
          accessToken: mockToken,
          activityStatus: ActivityStatus.ACTIVE,
          deletedAt: null,
        },
      });
    });

    it('should throw error when access token is invalid', async () => {
      // Arrange
      const invalidToken = 'invalid-token';
      prisma.clientTokens.findFirst = jest.fn().mockResolvedValue(null);

      // Act & Assert
      await expect(service.checkAccessToken(invalidToken)).rejects.toEqual({
        type: ErrorsTypeEnum.ClientNotFound,
      });
    });
  });

  describe('checkId', () => {
    it('should return client when clientId is valid', async () => {
      // Arrange
      const clientId = 'client-id';
      const mockClient = createClientTokenFactory({ clientId });

      prisma.clientTokens.findFirst = jest.fn().mockResolvedValue(mockClient);

      // Act
      const result = await service.checkId(clientId);

      // Assert
      expect(result).toBe(mockClient);
      expect(prisma.clientTokens.findFirst).toHaveBeenCalledWith({
        where: {
          clientId,
          deletedAt: null,
        },
      });
    });

    it('should return false when clientId is invalid', async () => {
      // Arrange
      const clientId = 'invalid-id';
      prisma.clientTokens.findFirst = jest.fn().mockResolvedValue(null);

      // Act
      const result = await service.checkId(clientId);

      // Assert
      expect(result).toBe(false);
    });
  });
});
