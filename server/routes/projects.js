const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Project = require('../models/Project');

const router = express.Router();

// Создание папок, если их нет
const coversDir = path.join(__dirname, '..', 'uploads', 'covers');
const galleryDir = path.join(__dirname, '..', 'uploads', 'gallery');
[ coversDir, galleryDir ].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Настройки хранения для каждой категории
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'coverImage') {
      cb(null, coversDir);
    } else if (file.fieldname === 'galleryImages') {
      cb(null, galleryDir);
    } else {
      cb(null, path.join(__dirname, '..', 'uploads'));
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ storage });

// Добавление проекта с обложкой и галереей
router.post('/', upload.fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'galleryImages', maxCount: 10 }
]), async (req, res) => {
  try {
    const { title, description } = req.body;

    const coverImagePath = req.files['coverImage']
      ? `/uploads/covers/${req.files['coverImage'][0].filename}`
      : '';
    const galleryPaths = req.files['galleryImages']
      ? req.files['galleryImages'].map(file => `/uploads/gallery/${file.filename}`)
      : [];

const newProject = new Project({
  title,
  description,
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

// Получение всех проектов
router.get('/', async (req, res) => {
  try {
    const projects = await Project.find();
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка при получении проектов' });
  }
});

module.exports = router;
