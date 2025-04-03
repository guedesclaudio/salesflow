import { Module } from '@nestjs/common';
import { CommonModule } from './common';
import { LoggerModule } from 'nestjs-pino';
import { logConfig } from '../config';
import { AuthModule } from './auth/auth.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriverConfig } from '@nestjs/apollo';
import { graphqlConfig } from '../config/graphql.config';
import { SalesModule } from './sales/sales.module';
import { BullBoardModule } from '@bull-board/nestjs';
import { FastifyAdapter } from "@bull-board/fastify";

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
