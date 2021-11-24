import { Model, model, Schema, Document } from "mongoose";

interface Attrs {
  method_name: string;
  method_sighash?: string;
  value: number;
  wallet: {
    ADDRESS: string;
    PRIVATE_KEY: string;
  };
  token: string;
  signature: string;
  price_impact: string;
  amount_balance?: number;
  action: string; // make it from method used
  is_out_bot?: boolean;
  is_sold_out?: boolean;
}

interface TradeModel extends Model<TradeDoc> {
  build(attrs: Attrs): TradeDoc;
}

interface TradeDoc extends Document {
  method_name: string;
  method_sighash?: string;
  value: number;
  wallet: {
    ADDRESS: string;
    PRIVATE_KEY: string;
  };
  token: string;
  signature: string;
  price_impact: string;
  amount_balance?: number;
  action: string; // make it from method used
  is_out_bot?: boolean;
  timestamp: Date;
  is_sold_out?: boolean;
}

const tradeSchema = new Schema(
  {
    method_name: { type: String },
    method_sighash: { type: String },
    value: { type: Number },
    token: { type: String },
    wallet: {
      ADDRESS: { type: String },
      PRIVATE_KEY: { type: String },
    },
    signature: { type: String },
    price_impact: { type: String },
    action: { type: String }, // make it from method used
    is_out_bot: { type: Boolean, default: false },
    amount_balance: { type: Number, default: 0 },
    s_sold_out: { type: Boolean, default: false },
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
