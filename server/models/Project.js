const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: String,
  description: String,
  coverImage: String,
  galleryImages: [String],
  category: {
    type: String,
    enum: ['жилые', 'общественные', 'коттеджи'],
    required: true
  },
  year: {
    type: Number,
    required: true
  }
});

module.exports = mongoose.model('Project', projectSchema);
