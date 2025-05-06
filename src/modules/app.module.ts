import { FastifyAdapter } from '@bull-board/fastify';
import { BullBoardModule } from '@bull-board/nestjs';
import { ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { LoggerModule } from 'nestjs-pino';
import { logConfig } from '../config';
import { graphqlConfig } from '../config/graphql.config';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common';
import { SalesModule } from './sales/sales.module';

@Module({
    imports: [
        // ServeStaticModule.forRoot({
        //     rootPath: join(__dirname, '..', 'public'),
        //     exclude: ['/graphql*', '/health*'],
        //   }),
        LoggerModule.forRoot(logConfig()),
        CommonModule,
        AuthModule,
        GraphQLModule.forRoot<ApolloDriverConfig>(graphqlConfig),
        BullBoardModule.forRoot({
            route: '/queues',
            adapter: FastifyAdapter,
        }),
        SalesModule,
    ],
})
export class ApplicationModule {}
