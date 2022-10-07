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
        users: [
          {
            type: Schema.Types.ObjectId,
            red: 'User'
          }
        ],
        lamp: {
          type: Schema.Types.ObjectId,
          red: 'Lamp'
        },
        location: {
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
        },
        finished: {
          type: Boolean,
          required: true
        },
        finishedDate: {
          type: Date,
          required: false
        }
      }
    ],
    lampsRepaired: [
      {
        users: [
          {
            type: Schema.Types.ObjectId,
            red: 'User'
          }
        ],
        oldLamp: {
          type: Schema.Types.ObjectId,
          red: 'Lamp'
        },
        newLamp: {
          type: Schema.Types.ObjectId,
          red: 'Lamp'
        },
        finished: {
          type: Boolean,
          required: true
        },
        finishedDate: {
          type: Date,
          required: false
        }
      }
    ],
    finishedDate: {
      type: Date,
      required: false
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model('Service', serviceSchema);