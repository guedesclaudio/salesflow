import { Controller, Post, Body } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { GenerateTokenInputSchema } from '../schemas/inputs';
import { AuthService } from '../services';
import { appRoutes } from '../../app.routes';
import { GenerateTokenOutputSchema } from '../schemas/outputs';
import { ApiResponses } from '../../common/decorators';

@ApiTags(appRoutes.auth.main)
@Controller(appRoutes.auth.main)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post(appRoutes.auth.generateJWTToken)
  @ApiOperation({ summary: 'Generate JWT token' })
  @ApiResponses({ sucessStatusCode: 201, succesType: GenerateTokenOutputSchema, isProtected: false })
  public generateToken(@Body() generateTokenDto: GenerateTokenInputSchema): Promise<GenerateTokenOutputSchema> {
    return this.authService.generateToken(generateTokenDto);
  }
}
