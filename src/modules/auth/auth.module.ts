import { Module } from '@nestjs/common';
import { ClientModule } from '../clients/client.module';
import { AuthController } from './controllers';
import { AuthResolver } from './resolvers';
import { AuthService } from './services';

@Module({
  imports: [ClientModule],
  providers: [AuthService, AuthResolver],
  controllers: [AuthController],
})
export class AuthModule {}
