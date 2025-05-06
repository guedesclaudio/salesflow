import { Sales, SaleStatus } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { v4 as uuid } from 'uuid';

export const createSale = (override: Partial<Sales> = {}): Sales => ({
  id: uuid(),
  authorizationCode: faker.string.alphanumeric(10).toUpperCase(),
  clientId: uuid(),
  saleStatus: SaleStatus.PENDING,
  value: faker.number.int({ min: 1000, max: 100000 }),
  userCode: faker.string.numeric(11),
  saleDate: faker.date.recent(),
  cancelSaleDate: null,
  webhook: faker.internet.url(),
  origin: 'WEB',
  log: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  ...override,
});
