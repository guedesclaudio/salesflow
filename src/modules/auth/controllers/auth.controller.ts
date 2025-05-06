import { Controller, Post, Body } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { appRoutes } from '../../app.routes';
import { ApiResponses } from '../../common/decorators';
import { GenerateTokenInputSchema } from '../schemas/inputs';
import { GenerateTokenOutputSchema } from '../schemas/outputs';
import { AuthService } from '../services';

@ApiTags(appRoutes.auth.main)
@Controller(appRoutes.auth.main)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post(appRoutes.auth.generateJWTToken)
  @ApiOperation({ summary: 'Generate JWT token' })
  @ApiResponses({
    sucessStatusCode: 201,
    succesType: GenerateTokenOutputSchema,
    isProtected: false,
  })
  public async generateToken(
    @Body() generateTokenDto: GenerateTokenInputSchema,
  ): Promise<GenerateTokenOutputSchema> {
    return this.authService.generateToken(generateTokenDto);
  }
}
