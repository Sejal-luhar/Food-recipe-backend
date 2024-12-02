const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const Recipe=require('./RecipeSchema')

const UserSchema = new mongoose.Schema({
  username: String,
  email: String,
  name: String,
  recipes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }],
},{timestamps:true});


// Add Passport-Local Mongoose plugin to handle username and password hashing
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);

