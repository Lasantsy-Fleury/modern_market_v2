import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LibelleBilingueDto {
  @ApiProperty({ example: 'Droit mensuel' })
  mg: string;

  @ApiProperty({ example: 'Droit mensuel' })
  fr: string;
}
