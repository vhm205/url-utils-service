import { IsUrl } from 'class-validator';

export class CreateMiniUrlDto {
  @IsUrl({
    require_protocol: true,
  })
  url: string;
}
