const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Project = require('../models/Project');
const auth = require('../middleware/authMiddleware');

const router = express.Router();

const coversDir = path.join(__dirname, '..', 'uploads', 'covers');
const galleryDir = path.join(__dirname, '..', 'uploads', 'gallery');

[coversDir, galleryDir].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'coverImage') cb(null, coversDir);
    else if (file.fieldname === 'galleryImages') cb(null, galleryDir);
    else cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ storage });

// 🔹 GET все проекты
router.get('/', async (req, res) => {
  try {
    const projects = await Project.find().sort({ year: -1 });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка при получении проектов' });
  }
});

router.get('/', async (req, res) => {
  try {
    const { category, year } = req.query;
    const filter = {};
    if (category && category !== 'все') filter.category = category;
    if (year) filter.year = parseInt(year, 10);
    const projects = await Project.find(filter).sort({ year: -1 });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка при получении проектов' });
  }
});


// 🔹 POST
router.post('/', auth, upload.fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'galleryImages', maxCount: 10 }
]), async (req, res) => {
  try {
    const { title, description = '', category, year } = req.body;

    const coverImagePath = req.files['coverImage']
      ? `/uploads/covers/${req.files['coverImage'][0].filename}`
      : '';

    const galleryPaths = req.files['galleryImages']
      ? req.files['galleryImages'].map(f => `/uploads/gallery/${f.filename}`)
      : [];

    const newProject = new Project({
      title,
      description,
      category,
      year: parseInt(year),
      coverImage: coverImagePath,
      galleryImages: galleryPaths
    });

    await newProject.save();
    res.status(201).json(newProject);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка при создании проекта' });
  }
});

// 🔹 PUT обновление
router.put('/:id', auth, upload.fields([
  { name: 'coverImage', maxCount: 1 }
]), async (req, res) => {
  try {
    const { title, description = '', category, year } = req.body;

    const updateData = {
      title,
      description,
      category,
      year: parseInt(year)
    };

if (req.files['coverImage']) {
  const filename = req.files['coverImage'][0].filename;
  updateData.coverImage = `/uploads/covers/${filename}`;
}


    const updated = await Project.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updated) return res.status(404).json({ message: 'Проект не найден' });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка при обновлении проекта' });
  }
});

// 🔹 DELETE
router.delete('/:id', auth, async (req, res) => {
  try {
    const deleted = await Project.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Проект не найден' });
    res.json({ message: 'Удалено' });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка при удалении проекта' });
  }
});

module.exports = router;
