const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { UserSchema } = require("./user");

const FundRequestSchema = new Schema({
  amount: {
    type: Number,
    required: true
  },
  coin: {
    type: String,
    required: true
  },
  receiver: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  timeSent: {
    type: Date,
    default: Date.now
  },
  subject: {
    type: String,
    default: ""
  }
})

module.exports = mongoose.model("FundRequest", FundRequestSchema);