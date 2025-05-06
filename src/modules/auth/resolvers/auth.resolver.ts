import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { GenerateTokenInputSchema } from '../schemas/inputs';
import { GenerateTokenOutputSchema } from '../schemas/outputs';
import { AuthService } from '../services';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => GenerateTokenOutputSchema, { name: 'generateJWTToken' })
  async generateToken(
    @Args('input') generateTokenDto: GenerateTokenInputSchema,
  ): Promise<GenerateTokenOutputSchema> {
    return this.authService.generateToken(generateTokenDto);
  }
}
