const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const modelSchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    fabricator: {
      type: String,
      required: true
    },
    fabrication_date: {
      type: Date,
      required: true
    },
    life_time: {
      type: Number,
      required: true
    }
  }
)

module.exports = mongoose.model('Model', modelSchema);