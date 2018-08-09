// require mongoose
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// establishes user schema
var userSchema = new Schema({
  username: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  documents: {
    type: Array,
    required: false
  }
});

// creates User model based on userSchema
var User = mongoose.model('User', userSchema);

// establishes doc schema
var docSchema = new Schema({
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  title: {
    type: String,
    required: true
  },
  body: {
    type: Schema.Types.Mixed,
    required: false
  },
  collabs: {
    type: [mongoose.Schema.ObjectId],
    ref: 'User'
  }
})

// creates Doc model based on docSchema
var Doc = mongoose.model('Doc', docSchema);

//exports User and Doc models
module.exports = {
  User: User,
  Doc: Doc
};
