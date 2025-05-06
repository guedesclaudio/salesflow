import { ObjectType, Field } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

@ObjectType()
export class GenerateTokenOutputSchema {
  @ApiProperty({
    description: 'JWT token generated based on the provided credentials',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  @Field(() => String, { description: 'JWT token generated based on the provided credentials' })
  token: string;
}
