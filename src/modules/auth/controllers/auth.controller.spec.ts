import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from '../services';
import { GenerateTokenInputSchema } from '../schemas/inputs';
import { GenerateTokenOutputSchema } from '../schemas/outputs';
import { Role } from '../../tokens';

const mockAuthService = {
  generateToken: jest.fn(),
};

describe(AuthController.name, () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  describe('generateToken', () => {
    it('should return a token when given valid input', async () => {
      // Arrange
      const input: GenerateTokenInputSchema = {
        role: Role.RESTRICTED,
        accessToken: 'jwt.token.here',
      };
      const expected: GenerateTokenOutputSchema = {
        token: 'token.here',
      };
      mockAuthService.generateToken.mockResolvedValue(expected);

      // Act
      const result = await controller.generateToken(input);

      // Assert
      expect(result).toEqual(expected);
      expect(mockAuthService.generateToken).toHaveBeenCalledWith(input);
    });
  });
});
