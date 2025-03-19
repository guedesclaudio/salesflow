import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GenerateTokenOutputSchema {
  @ApiProperty({
    description: 'JWT token generated based on the provided credentials',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  token: string;
}

