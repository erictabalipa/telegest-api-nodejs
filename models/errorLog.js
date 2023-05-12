const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const errorLogSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      red: 'User',
      required: true
    },
    error: {
      type: String,
      required: true
    },
    lamp: {
      type: Schema.Types.ObjectId,
      red: 'Lamp',
      required: true
    },
    radio: {
      type: Number,
      required: true
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model('errorLog', errorLogSchema);