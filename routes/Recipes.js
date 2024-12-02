const express = require('express');
const router = express.Router();
const Recipe = require('../models/RecipeSchema');
const User = require('../models/UserSchema');
const upload = require('../config/multerConfig'); // Import multer configuration

// Middleware to check authentication
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ message: 'Unauthorized' });
};

// Add a new recipe




router.post('/', isAuthenticated, upload.single('image'), async (req, res) => {
  try {
    console.log('Request body:', req.body);
    console.log('Uploaded file:', req.file);

    const { title, ingredients, instructions } = req.body;
    const imageUrl = req.file ? req.file.filename : '';

    // Create a new recipe
    const recipe = new Recipe({
      title,
      ingredients,
      instructions,
      image: imageUrl,
      createdBy: req.user._id,
    });

    // Save the recipe
    await recipe.save();

    // Update the user's recipes array
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $push: { recipes: recipe._id } }, // Push the recipe ID to the user's recipes array
      { new: true } // Return the updated user document
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(201).json(recipe);
  } catch (err) {
    console.error('Error saving recipe:', err.message);
    res.status(400).json({ error: err.message });
  }
});



// Get recipes by logged-in user
router.get('/', isAuthenticated, async (req, res) => {
  try {
    // Fetch recipes created by the logged-in user
    const recipes = await Recipe.find({ createdBy: req.user._id });
    res.json(recipes);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get a specific recipe
router.get('/:id', isAuthenticated, async (req, res) => {
  try {
    // Fetch the specific recipe and populate the creator's username
    const recipe = await Recipe.findById(req.params.id).populate('createdBy', 'username');
    if (!recipe) return res.status(404).json({ message: 'Recipe not found' });
    res.json(recipe);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a recipe
router.delete('/:id', isAuthenticated, async (req, res) => {
  try {
    // Find and delete the recipe that belongs to the logged-in user
    const recipe = await Recipe.findOneAndDelete({ _id: req.params.id, createdBy: req.user._id });
    if (!recipe) return res.status(404).json({ message: 'Recipe not found or unauthorized' });

    // Optionally, remove the recipe from the user's recipes list as well
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { recipes: recipe._id }, // Remove the recipe ID from the user's recipes array
    });

    res.json({ message: 'Recipe deleted successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update a recipe
router.put('/:id', isAuthenticated, upload.single('image'), async (req, res) => {
  try {
    const { title, ingredients, instructions } = req.body;
    const recipeId = req.params.id;
    const imageUrl = req.file ? req.file.filename : null;

    // Find the recipe and ensure it's the user's recipe
    const recipe = await Recipe.findOne({ _id: recipeId, createdBy: req.user._id });
    if (!recipe) return res.status(404).json({ message: 'Recipe not found or unauthorized' });

    // Update the recipe fields
    recipe.title = title || recipe.title;
    recipe.ingredients = ingredients || recipe.ingredients;
    recipe.instructions = instructions || recipe.instructions;

    // Update image if a new one is uploaded
    if (imageUrl) {
      recipe.image = imageUrl; // Replace old image with the new one
    }

    // Save the updated recipe
    await recipe.save();
    res.json(recipe); // Respond with the updated recipe
  } catch (err) {
    console.error('Error updating recipe:', err.message);
    res.status(400).json({ error: err.message });
  }
});


module.exports = router;
