import * as jwt from 'jsonwebtoken';
import { Role } from '../../tokens';

export function extractTokenPayload(request: {
  headers?: Record<string, any>;
}): { role: Role; clientId: string } | null {
  const header = request?.headers?.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return null;
  }

  const [, tokenChunk] = header.split(' ');
  if (!tokenChunk) {
    return null;
  }

  try {
    const env = process.env;
    const payload = jwt.verify(tokenChunk, `${env.JWT_SECRET}`, {
      algorithms: ['HS256'],
      issuer: env.JWT_ISSUER,
    });

    if (typeof payload === 'string') {
      return null;
    }

    return payload as { role: Role; clientId: string };
  } catch (err) {
    return null;
  }
}
