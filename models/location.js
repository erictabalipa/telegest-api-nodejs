const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const locationSchema = new Schema(
  {
    number: {
      type: Number,
      required: true
    },
    zip_code: {
      type: String,
      required: true
    },
    street: {
      type: String,
      required: true
    },
    district: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    reference: String
  }
)

module.exports = mongoose.model('Location', locationSchema);