const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const deletedServiceSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      red: 'User',
      required: true
    },
    code: {
      type: String,
      required: true
    },
    priority: {
      type: String,
      required: true
    },
    deadline: {
      type: Date,
      required: false
    },
    instalations: [
      {
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
        materialsUsed: {
          type: String,
          required: false
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
    correctiveMaintenances: [
      {
        lamp: {
          type: Schema.Types.ObjectId,
          red: 'Lamp'
        },
        newlamp: {
          type: Schema.Types.ObjectId,
          red: 'Lamp',
          required: false
        },
        materialsUsed: {
          type: String,
          required: false
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
    preventiveMaintenances: [
      {
        lamp: {
          type: Schema.Types.ObjectId,
          red: 'Lamp',
          required: true
        },
        newlamp: {
          type: Schema.Types.ObjectId,
          red: 'Lamp',
          required: false
        },
        materialsUsed: {
          type: String,
          required: false
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
    },
    deletedBy: {
      type: Schema.Types.ObjectId,
      red: 'User',
      required: true
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model('Service', deletedServiceSchema);