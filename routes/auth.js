const express = require('express');
const router = express.Router();
const User = require('../models/User');
const crypto = require('crypto');

function validateRegister(req, res, next) {
  const { firstName, lastName, email, password, confirmPassword } = req.body;
  if (!firstName || !lastName || !email || !password || !confirmPassword) {
    req.flash('error', 'Tous les champs sont obligatoires');
    return res.redirect('/register');
  }
  if (password !== confirmPassword) {
    req.flash('error', 'Les mots de passe ne correspondent pas');
    return res.redirect('/register');
  }
  next();
}

router.get('/register', (req, res) => {
  res.render('register', { messages: req.flash('error') });
});

router.post('/register', validateRegister, async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      req.flash('error', 'L\'utilisateur existe déjà');
      return res.redirect('/register');
    }

    const user = new User({ firstName, lastName, email });
    user.setPassword(password);
    await user.save();
    res.redirect('/login');
  } catch (error) {
    req.flash('error', 'Erreur lors de l\'enregistrement');
    res.redirect('/register');
  }
});

router.get('/login', (req, res) => {
  res.render('login', { messages: req.flash('error') });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      req.flash('error', 'Email ou mot de passe incorrect');
      return res.redirect('/login');
    }

    const hmac = crypto.createHmac('sha256', process.env.SECRET_KEY);
    hmac.update(password);
    if (user.password !== hmac.digest('hex')) {
      req.flash('error', 'Email ou mot de passe incorrect');
      return res.redirect('/login');
    }

    req.session.userId = user._id;
    res.redirect('/dashboard');
  } catch (error) {
    req.flash('error', 'Erreur lors de la connexion');
    res.redirect('/login');
  }
});

module.exports = router;
