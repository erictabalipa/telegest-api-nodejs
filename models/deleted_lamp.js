const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const deletedLampSchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    model: {
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
    },
    location: {
      number: Number,
      zip_code: String,
      street: String,
      district: String,
      state: String,
      reference: String
    },
    oldId: {
      type: String,
      required: true
    },
    deletedBy: {
      type: Schema.Types.ObjectId,
      red: 'User',
      required: true
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model('DeletedLamp', deletedLampSchema);