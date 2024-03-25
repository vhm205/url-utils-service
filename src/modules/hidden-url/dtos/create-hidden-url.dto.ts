import { IsString, IsUrl, MaxLength, MinLength } from 'class-validator';

export class CreateHiddenUrlDto {
  @IsUrl({
    require_protocol: true,
  })
  url: string;

  @IsString()
  @MaxLength(20)
  @MinLength(3)
  backHalf: string;
}
