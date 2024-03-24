import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
  collection: 'hidden_url',
  timestamps: true,
  versionKey: false,
})
export class HiddenUrl {
  @Prop({ required: true, unique: true })
  shortUrl: string;

  @Prop({ required: true })
  hiddenUrl: string;

  @Prop({ unique: true, required: true })
  mid: string;
}

export const HiddenUrlSchema = SchemaFactory.createForClass(HiddenUrl);
