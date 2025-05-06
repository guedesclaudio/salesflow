import { ClientTokens, ActivityStatus } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { v4 as uuid } from 'uuid';

export const createClientTokenFactory = (override: Partial<ClientTokens> = {}): ClientTokens => ({
  id: faker.number.int(),
  clientId: uuid(),
  accessToken: faker.string.uuid(),
  activityStatus: ActivityStatus.ACTIVE,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  ...override,
});
