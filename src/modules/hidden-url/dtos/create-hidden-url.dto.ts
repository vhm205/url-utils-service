import { IsUrl } from 'class-validator';

export class CreateHiddenUrlDto {
  @IsUrl({
    require_protocol: true,
  })
  url: string;
}
