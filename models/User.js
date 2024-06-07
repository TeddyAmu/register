const mongoose = require('mongoose');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

userSchema.methods.setPassword = function(password) {
  const hmac = crypto.createHmac('sha256', process.env.SECRET_KEY);
  hmac.update(password);
  this.password = hmac.digest('hex');
};

const User = mongoose.model('User', userSchema);
module.exports = User;
