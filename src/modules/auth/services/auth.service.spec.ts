import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { ClientValidator } from '../../clients/validators';
import * as jwt from 'jsonwebtoken';
import { GenerateTokenInputSchema } from '../schemas/inputs';
import { Role } from '../../tokens';

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'mocked.jwt.token'),
}));

const mockClientValidator = {
  checkAccessToken: jest.fn(),
};

describe(AuthService.name, () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: ClientValidator, useValue: mockClientValidator },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('generateToken', () => {
    it('should return a JWT token when given valid input', async () => {
      // Arrange
      const input: GenerateTokenInputSchema = {
        accessToken: 'access-token-value',
        role: Role.RESTRICTED,
      };
      const clientId = 'client-id-123';

      mockClientValidator.checkAccessToken.mockResolvedValue({ clientId });

      // Act
      const result = await service.generateToken(input);

      // Assert
      expect(mockClientValidator.checkAccessToken).toHaveBeenCalledWith(input.accessToken);
      expect(jwt.sign).toHaveBeenCalledWith(
        { role: input.role, clientId },
        expect.any(String),
        expect.objectContaining({ expiresIn: '1h', issuer: expect.any(String), algorithm: 'HS256' })
      );
      expect(result).toEqual({ token: 'mocked.jwt.token' });
    });
  });
});
