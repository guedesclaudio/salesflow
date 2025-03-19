import { Module } from '@nestjs/common';
import { CommonModule } from './common';
import { LoggerModule } from 'nestjs-pino';
import { logConfig } from '../config';
import { AuthModule } from './auth/auth.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriverConfig } from '@nestjs/apollo';
import { graphqlConfig } from '../config/graphql.config';

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
    ],
})
export class ApplicationModule {}
