import { Module } from '@nestjs/common';
import { AuthController } from './controllers';
import { AuthService } from './services';
import { ClientModule } from '../clients/client.module';
import { AuthResolver } from './resolvers';

@Module({
  imports: [ClientModule],
  providers: [AuthService, AuthResolver],
  controllers: [AuthController],
})
export class AuthModule {}
