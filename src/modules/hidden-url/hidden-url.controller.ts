import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Res,
  VERSION_NEUTRAL,
  Version,
} from '@nestjs/common';
import { Response } from 'express';
import { CreateHiddenUrlDto } from './dtos/create-hidden-url.dto';
import { HiddenUrlService } from './hidden-url.service';
import { ResponseType } from '@common';

@Controller({
  path: 'hidden',
})
export class HiddenUrlController {
  constructor(private readonly hiddenUrlService: HiddenUrlService) {}

  @Post('')
  @Version(process.env.API_VERSION || VERSION_NEUTRAL)
  createHiddenUrl(@Body() body: CreateHiddenUrlDto) {
    return this.hiddenUrlService.createHiddenUrl(body.url);
  }

  @Get('/:mid')
  async getHiddenUrl(@Param('mid') mid: string, @Res() res: Response) {
    const link = await this.hiddenUrlService.getHiddenUrl(mid);
    res.redirect(link);
  }

  @Patch('/:mid')
  @Version(process.env.API_VERSION || VERSION_NEUTRAL)
  updateHiddenUrl(@Param('mid') mid: string, @Body('url') url: string) {
    return this.hiddenUrlService.updateHiddenUrl(mid, url);
  }

  @Delete('/:mid')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Version(process.env.API_VERSION || VERSION_NEUTRAL)
  deleteMiniUrl(@Param('mid') mid: string): Promise<ResponseType> {
    return this.hiddenUrlService.deleteHiddenUrl(mid);
  }
}
