const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const changeLogSchema = new Schema(
  {
    user: {
      type: String,
      required: true
    },
    whatWasDone: {
      type: String,
      required: true
    },
    whatWasChanged: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model('changeLog', changeLogSchema);