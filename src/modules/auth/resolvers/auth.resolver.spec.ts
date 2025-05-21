import { Test, TestingModule } from '@nestjs/testing';
import { AuthResolver } from './auth.resolver';
import { AuthService } from '../services';
import { GenerateTokenInputSchema } from '../schemas/inputs';
import { GenerateTokenOutputSchema } from '../schemas/outputs';
import { Role } from '../../tokens';

const mockAuthService = {
  generateToken: jest.fn(),
};

describe(AuthResolver.name, () => {
  let resolver: AuthResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthResolver,
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compile();

    resolver = module.get<AuthResolver>(AuthResolver);
  });

  describe('generateToken', () => {
    it('should return a JWT token from AuthService', async () => {
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
      const result = await resolver.generateToken(input);

      // Assert
      expect(result).toEqual(expected);
      expect(mockAuthService.generateToken).toHaveBeenCalledWith(input);
    });
  });
});
