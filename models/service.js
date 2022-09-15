const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const serviceSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      red: 'User',
      required: true
    },
    lampsInstalled: [
      {
        type: Schema.Types.ObjectId,
        red: 'Lamp'
      }
    ],
    lampsRepaired: [
      {
        type: Schema.Types.ObjectId,
        red: 'Lamp'
      }
    ],
    date: {
      type: Date,
      required: true
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model('Service', serviceSchema);