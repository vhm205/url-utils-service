import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MiniUrl, MiniUrlSchema } from '@schema';
import { MiniUrlController } from './miniurl.controller';
import { MiniUrlService } from './miniurl.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: MiniUrl.name, schema: MiniUrlSchema }]),
  ],
  providers: [MiniUrlService],
  controllers: [MiniUrlController],
})
export class MiniUrlModule {}
