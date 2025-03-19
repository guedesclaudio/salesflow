import { Module } from '@nestjs/common';
import { CommonModule } from './common';
import { LoggerModule } from 'nestjs-pino';
import { logConfig } from '../config';

@Module({
    imports: [
        // ServeStaticModule.forRoot({
        //     rootPath: join(__dirname, '..', 'public'),
        //     exclude: ['/graphql*', '/health*'],
        //   }),
        LoggerModule.forRoot(logConfig()),
        CommonModule,
    ],
})
export class ApplicationModule {}
