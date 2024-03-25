import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
  collection: 'hidden_url',
  timestamps: true,
  versionKey: false,
})
export class HiddenUrl {
  @Prop({ required: true })
  hiddenUrl: string;

  @Prop({ maxlength: 20, minlength: 3, required: false, default: '' })
  backHalf: string;

  @Prop({ unique: true, required: true })
  mid: string;
}

export const HiddenUrlSchema = SchemaFactory.createForClass(HiddenUrl);
