var express = require('express');
var router = express.Router();

const passport = require('passport');
const User = require('../models/UserSchema');

// Home Page
router.get('/', (req, res) => {
  res.render('index', { title: 'Express' });
});

// Register User

router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const user = new User({ username, email }); // Include email in user creation
    await User.register(user, password);
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


// Login User
router.post('/login', passport.authenticate('local'), (req, res) => {
  res.status(200).json({
    message: 'Logged in successfully',
    user: {
      id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      name: req.user.name,
    },
  });
});

// Logout User
router.get('/logout', (req, res) => {
  req.logout(err => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json({ message: 'Logged out successfully' });
  });
});

// router.get('/profile', async (req, res) => {
//   // Check if the user is authenticated
//   if (!req.isAuthenticated()) {
//     return res.status(401).json({ message: 'Unauthorized' });
//   }

//   try {
//     // Fetch user and populate the recipes field
//     const user = await User.findById(req.user._id).populate('recipes');

//     // Check if the user exists
//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     // Respond with the user data
//     res.status(200).json({
//       user: {
//         id: user._id,
//         username: user.username,
//         email: user.email,
//         name: user.name || '', // Ensure `name` has a fallback
//         recipes: user.recipes || [], // Return populated recipes
//       },
//     });
//   } catch (err) {
//     // Handle server errors
//     res.status(500).json({ message: 'Error fetching user profile', error: err.message });
//   }
// });
router.get('/profile', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const user = await User.findById(req.user._id).populate('recipes');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        name: user.name || '',
        recipes: user.recipes || [],
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching user profile', error: err.message });
  }
});




module.exports = router;
