const mongoose = require('mongoose');
const MONGODB_URI = 'mongodb+srv://' + "telegestao" + ':' + "telegestao_tcc" + '@cluster0.izanfqg.mongodb.net/' + "tcc";

mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

module.exports = mongoose.connection;