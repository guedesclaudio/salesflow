// src/sales/dto/sales.output.ts
import { ObjectType, Field, Int, Float } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { SaleStatus } from '@prisma/client';

@ObjectType()
export class SaleOutputSchema {
  @ApiProperty({ description: 'Unique sale identifier', example: 1 })
  @Field(() => Int, { description: 'Unique sale identifier' })
  id: number;

  @ApiProperty({
    description: 'Authorization code for the sale',
    example: 'AUTH1234',
    maxLength: 20,
  })
  @Field(() => String, { description: 'Authorization code for the sale' })
  authorizationCode: string;

  @ApiProperty({ description: 'ID of the client', example: 123 })
  @Field(() => Int, { description: 'ID of the client' })
  clientId: number;

  @ApiProperty({
    description: 'Sale status',
    enum: SaleStatus,
    example: SaleStatus.PENDING,
  })
  @Field(() => String, { description: 'Sale status' })
  saleStatus: SaleStatus;

  @ApiProperty({ description: 'Sale value', example: 99.99 })
  @Field(() => Float, { description: 'Sale value' })
  value: number;

  @ApiProperty({
    description: 'User code associated with the sale',
    example: 'USER1234567',
    maxLength: 11,
  })
  @Field(() => String, { description: 'User code associated with the sale' })
  userCode: string;

  @ApiProperty({
    description: 'Sale date in ISO format',
    example: '2025-03-20T12:00:00Z',
  })
  @Field(() => Date, { description: 'Sale date in ISO format' })
  saleDate: Date;

  @ApiProperty({
    description: 'Creation date in ISO format',
    example: '2025-03-20T12:00:00Z',
  })
  @Field(() => Date, { description: 'Creation date in ISO format' })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update date in ISO format',
    example: '2025-03-20T12:00:00Z',
  })
  @Field(() => Date, { description: 'Last update date in ISO format' })
  updatedAt: Date;

  @ApiProperty({
    description: 'Deletion date in ISO format (if applicable)',
    example: '2025-03-20T12:00:00Z',
    nullable: true,
  })
  @Field(() => Date, { description: 'Deletion date in ISO format', nullable: true })
  deletedAt?: Date;
}
