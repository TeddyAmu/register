require('dotenv').config();
const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3000;

mongoose.connect('mongodb://localhost:27017/students', { useNewUrlParser: true, useUnifiedTopology: true });

app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true
}));
app.use(flash());

app.use((req, res, next) => {
  res.locals.messages = req.flash();
  next();
});

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.redirect('/register');
});

app.use('/', authRoutes);

function ensureAuthenticated(req, res, next) {
  if (req.session.userId) {
    return next();
  } else {
    req.flash('error', 'Vous devez être connecté pour accéder à cette page');
    res.redirect('/login');
  }
}

app.get('/dashboard', ensureAuthenticated, (req, res) => {
  res.send('Bienvenue sur votre tableau de bord');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
