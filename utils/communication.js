const Dimerize = require('../models/dimerize');
const Lamp = require('../models/lamp');

async function waitForChangeOrDelete(dimmingId) {
  let finished = false;
  const changeOrDeleteStream = Dimerize.watch();
  do{
    await new Promise((resolve, reject) => {
      changeOrDeleteStream.on('change', (change) => {
        resolve(change);
      });
    }).then(async (result) => {
      console.log(result);
      if(result.documentKey._id == dimmingId) {
        if(result.operationType == 'delete') {
          finished = true;
        } else if (result.operationType == 'update'){
          finished = true;
          const error = new Error(result.updateDescription.updatedFields.error);
          error.statusCode = 500;
          await Dimerize.findByIdAndDelete(result.documentKey._id);
          await Lamp.findOneAndUpdate({ radioId: dimmingId }, { online: false });
          throw error;
        }
      }
    })
  } while(!finished);
  changeOrDeleteStream.close();
}

async function saveNewDimerize(radioId, percentage) {
  try {
    const dimming = new Dimerize({
      radioId: radioId,
      percentage: percentage
    })
    let dimmingId = '';
    await dimming.save().then(result => { dimmingId = result.id });
    await waitForChangeOrDelete(dimmingId);
  }
  catch (err) { throw err; }
}

module.exports.saveNewDimerize = saveNewDimerize;