import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { GenerateTokenInputSchema } from '../schemas/inputs';
import { ClientValidator } from '../../clients/validators';
import { ClientTokens } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(private readonly clientValidator: ClientValidator) {}
  
  public async generateToken(generateTokenDto: GenerateTokenInputSchema): Promise<{ token: string }> {
    const { id: clientId } = await this.clientValidator.checkAccessToken(generateTokenDto.accessToken) as ClientTokens;
    const payload = { role: generateTokenDto.role, clientId };
    const secretKey = process.env.JWT_SECRET || 'ThisMustBeChanged';
    const issuer = process.env.JWT_ISSUER || 'IssuerApplication';

    const token = jwt.sign(payload, secretKey, {
      expiresIn: '1h', // token expires in 1 hour
      issuer: issuer,
      algorithm: 'HS256',
    });

    return { token };
  }
}
