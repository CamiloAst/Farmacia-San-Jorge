const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  rol: { 
    type: String, 
    required: true, 
    enum: ['Administrador', 'Regente', 'Vendedor'] 
  }
});

module.exports = mongoose.model('User', userSchema);
