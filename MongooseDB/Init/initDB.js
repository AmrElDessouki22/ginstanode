const mongoose = require('mongoose')
mongoose.connect(process.env.GinstaDatabase, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology:true
})

module.exports = mongoose

