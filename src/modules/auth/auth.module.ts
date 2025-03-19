import { Module } from '@nestjs/common';
import { AuthController } from './controllers';
import { AuthService } from './services';
import { ClientModule } from '../clients/client.module';

@Module({
  imports: [ClientModule],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
