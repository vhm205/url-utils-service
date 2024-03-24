import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Res,
  VERSION_NEUTRAL,
  Version,
} from '@nestjs/common';
import { Response } from 'express';
import { CreateMiniUrlDto } from './dtos/create-mini-url.dto';
import { MiniUrlService } from './miniurl.service';

@Controller({
  path: 'mini',
})
export class MiniUrlController {
  constructor(private readonly miniUrlService: MiniUrlService) {}

  @Post('')
  @Version(process.env.API_VERSION || VERSION_NEUTRAL)
  createMiniUrl(@Body() body: CreateMiniUrlDto) {
    return this.miniUrlService.createMiniUrl(body.url);
  }

  @Get('/:mid')
  async getMiniUrl(@Param('mid') mid: string, @Res() res: Response) {
    const link = await this.miniUrlService.getMiniUrl(mid);
    res.redirect(link);
  }

  @Delete('/:mid')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Version(process.env.API_VERSION || VERSION_NEUTRAL)
  deleteMiniUrl(@Param('mid') mid: string) {
    return this.miniUrlService.deleteMiniUrl(mid);
  }
}
