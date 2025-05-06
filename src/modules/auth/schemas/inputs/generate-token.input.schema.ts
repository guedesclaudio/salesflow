import { InputType, Field } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Role } from '../../../tokens';

@InputType()
export class GenerateTokenInputSchema {
  @Field(() => Role, { description: 'Role for generating the token. Must be one of the allowed roles.' })
  @ApiProperty({
    description: 'Role for generating the token. Must be one of the allowed roles.',
    enum: Role,
    example: Role.RESTRICTED,
  })
  @IsEnum(Role)
  @IsNotEmpty()
  role: Role;

  @Field({ description: 'Access token used to validate the request.' })
  @ApiProperty({
    description: 'Access token used to validate the request.',
    example: 'exampleAccessToken123',
  })
  @IsString()
  @IsNotEmpty()
  accessToken: string;
}
