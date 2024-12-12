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
router.post('/login', (req, res, next) => {
  console.log('Received login data:', req.body);

  passport.authenticate('local', (err, user, info) => {
    if (err) {
      console.error('Passport error:', err);
      return res.status(500).json({ message: 'Server error', error: err.message });
    }

    if (!user) {
      console.error('Authentication failed:', info);
      return res.status(400).json({ message: info?.message || 'Invalid email or password' });
    }

    req.logIn(user, (loginErr) => {
      if (loginErr) {
        console.error('Login error:', loginErr);
        return res.status(500).json({ message: 'Error logging in', error: loginErr.message });
      }

      console.log('Login successful:', user);
      res.status(200).json({
        message: 'Login successful',
        user: {
          id: user._id,
          username:user.username,
          email:user.email,
          name:user.name,
        },
      });
    });
  })(req, res, next);
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
    console.log("profile page");
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    // Log user details for debugging
    console.log('Authenticated user:', req.user);

    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Send a single response with the user data
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
    console.error('Error fetching user profile:', err.message);
    res.status(500).json({ message: 'Error fetching user profile', error: err.message });
  }
});


module.exports = router;
