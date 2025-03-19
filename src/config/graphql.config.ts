import { ApolloDriver } from '@nestjs/apollo';
import { join } from 'path';

export const graphqlConfig: any = {
    driver: ApolloDriver,
    autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
    playground: process.env.NODE_ENV !== 'production',
    debug: process.env.NODE_ENV !== 'production',
    sortSchema: true,
};
