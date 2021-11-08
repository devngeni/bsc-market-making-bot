import { Model, model, Schema, Document } from "mongoose";

interface Attrs {
  method_name: string;
  method_sighash?: string;
  value: number;
  token: string;
  signature: string;
  price_impact: string;
  action: string; // make it from method used
  is_out_bot?: boolean;
}

interface TradeModel extends Model<TradeDoc> {
  build(attrs: Attrs): TradeDoc;
}

interface TradeDoc extends Document {
  method_name: string;
  method_sighash?: string;
  value: number;
  token: string;
  signature: string;
  price_impact: string;
  action: string; // make it from method used
  is_out_bot?: boolean;
  timestamp: Date;
}

const tradeSchema = new Schema(
  {
    method_name: { type: String },
    method_sighash: { type: String },
    value: { type: Number },
    token: { type: String },
    signature: { type: String },
    price_impact: { type: String },
    action: { type: String }, // make it from method used
    is_out_bot: { type: Boolean, default: false },
    timestamp: { type: Schema.Types.Date, default: Date.now },
  },
  {
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
      versionKey: false,
    },
  }
);

tradeSchema.statics.build = (attrs: Attrs) => {
  return new Trade(attrs);
};

const Trade = model<TradeDoc, TradeModel>("Trade", tradeSchema);
export { Trade, TradeDoc };
