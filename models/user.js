const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    password: {
      type: String,
      required: true
    },
    permission: {
      type: Schema.Types.ObjectId,
      red: 'Permission'
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model('User', userSchema);