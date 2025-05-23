import { InputType, Field, Float } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { SaleStatus } from '@prisma/client';
import { IsString, IsNotEmpty, IsNumber, IsDateString, IsOptional } from 'class-validator';
import { OriginSalesEnum } from '../../../../contracts/enums/sales.enum';

@InputType()
export class CreateSaleInputSchema {
  @ApiProperty({
    description: 'Authorization code for the sale',
    example: 'AUTH1234',
    maxLength: 20,
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Authorization code for the sale' })
  authorizationCode: string;

  @ApiProperty({
    description: 'Sale value',
    example: 99.99,
  })
  @IsNumber()
  @IsNotEmpty()
  @Field(() => Float, { description: 'Sale value' })
  value: number;

  @ApiProperty({
    description: 'User code associated with the sale',
    example: 'USER1234567',
    maxLength: 11,
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'User code associated with the sale' })
  userCode: string;

  @ApiProperty({
    description: 'Sale date in ISO format',
    example: '2025-03-20T12:00:00Z',
  })
  @IsDateString()
  @IsNotEmpty()
  @Field(() => Date, { description: 'Sale date in ISO format' })
  saleDate: Date;

  @ApiProperty({
    description: 'Cancel sale date in ISO format',
    example: '2025-03-20T12:00:00Z',
  })
  @IsDateString()
  @IsOptional()
  @Field(() => String, { description: 'Cancel sale date in ISO format', nullable: true })
  cancelSaleDate?: string;

  // Private
  origin: OriginSalesEnum;

  // Private
  clientId: string;

  @ApiProperty({
    description: 'Webhook notification URL',
    example: 'https://webhook.com/sale',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Webhook notification URL' })
  webhook: string;

  // Private
  saleStatus: SaleStatus;
}
