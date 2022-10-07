const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const lampSchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    model: {
      type: Schema.Types.ObjectId,
      red: 'Model',
      required: true
    },
    online: {
      type: Boolean,
      required: true
    },
    location: {
      type: Schema.Types.ObjectId,
      red: 'Location',
      required: false
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model('Lamp', lampSchema);