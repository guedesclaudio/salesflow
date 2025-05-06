import { Injectable } from '@nestjs/common';
import { ClientTokens } from '@prisma/client';
import * as jwt from 'jsonwebtoken';
import { ClientValidator } from '../../clients/validators';
import { GenerateTokenInputSchema } from '../schemas/inputs';

@Injectable()
export class AuthService {
  constructor(private readonly clientValidator: ClientValidator) {}

  public async generateToken(
    generateTokenDto: GenerateTokenInputSchema,
  ): Promise<{ token: string }> {
    const { clientId } = (await this.clientValidator.checkAccessToken(
      generateTokenDto.accessToken,
    )) as ClientTokens;
    const payload = { role: generateTokenDto.role, clientId };
    const secretKey = process.env.JWT_SECRET || 'ThisMustBeChanged';
    const issuer = process.env.JWT_ISSUER || 'IssuerApplication';

    const token = jwt.sign(payload, secretKey, {
      expiresIn: '1h',
      issuer,
      algorithm: 'HS256',
    });

    return { token };
  }
}
