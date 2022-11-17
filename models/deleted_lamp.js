const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const deletedLampSchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    modelName: {
      type: String,
      required: true
    },
    modelFabricator: {
      type: String,
      required: true
    },
    modelFabrication_date: {
      type: Date,
      required: true
    },
    modelLife_time: {
      type: Number,
      required: true
    },
    locationNumber: Number,
    locationZip_code: String,
    locationStreet: String,
    locationDistrict: String,
    locationState: String,
    locationReference: String,
    deletedBy: {
      type: Schema.Types.ObjectId,
      red: 'User',
      required: true
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model('DeletedLamp', deletedLampSchema);