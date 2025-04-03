import { InputType, Field } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

@InputType()
export class PaySaleInputSchema {
  @ApiProperty({
    description: 'Sale Identification',
    example: 'uuid',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Sale Identification' })
  saleId: string;
  
  // Private
  clientId: string;
}