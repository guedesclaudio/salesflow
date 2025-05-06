import { Clients, ActivityStatus } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { v4 as uuid } from 'uuid';

export const createClientFactory = (override: Partial<Clients> = {}): Clients => ({
  id: uuid(),
  code: faker.string.alphanumeric(8),
  name: faker.company.name(),
  activityStatus: ActivityStatus.ACTIVE,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  ...override,
});
