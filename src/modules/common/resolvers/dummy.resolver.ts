import { Resolver, Query } from '@nestjs/graphql';

@Resolver()
export class DummyResolver {
  @Query(() => String, { name: 'dummyQuery' })
  dummyQuery(): string {
    return 'Graphql is working!';
  }
}
