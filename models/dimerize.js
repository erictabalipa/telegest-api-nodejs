const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const dimerizeSchema = new Schema(
  {
    radioId: {
      type: Number,
      required: true
    },
    percentage: {
      type: Number,
      required: true
    },
    error: {
      type: String,
      required: false
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model('Dimerize', dimerizeSchema);