const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const permissionSchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    permissions: [
      {
        type: String
      }
    ]
  }
)

module.exports = mongoose.model('Permission', permissionSchema);