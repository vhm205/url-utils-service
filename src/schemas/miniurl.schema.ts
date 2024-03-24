import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
  collection: 'miniurl',
  timestamps: true,
  versionKey: false,
})
export class MiniUrl {
  @Prop({ required: true, unique: true })
  shortUrl: string;

  @Prop({ required: true })
  originalUrl: string;

  @Prop({ unique: true, required: true })
  mid: string;
}

export const MiniUrlSchema = SchemaFactory.createForClass(MiniUrl);
