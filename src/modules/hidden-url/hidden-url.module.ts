import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HiddenUrl, HiddenUrlSchema } from '@schema';
import { HiddenUrlController } from './hidden-url.controller';
import { HiddenUrlService } from './hidden-url.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: HiddenUrl.name, schema: HiddenUrlSchema },
    ]),
  ],
  providers: [HiddenUrlService],
  controllers: [HiddenUrlController],
})
export class HiddenUrlModule {}
