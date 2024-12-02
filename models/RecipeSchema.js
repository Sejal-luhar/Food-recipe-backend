const mongoose = require('mongoose');
const User=require('./UserSchema')

// Define the Recipe Schema
const RecipeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  ingredients: { type: String, required: true },
  instructions: { type: String, required: true },
  image: { type: String }, // Field to store the image URL (from multer)
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref:'User', required: true }, // Reference to the User model
}, {
  timestamps: true, // Automatically add createdAt and updatedAt fields
});

// Create the Recipe model based on the schema
module.exports = mongoose.model('Recipe', RecipeSchema);
