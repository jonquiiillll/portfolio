
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

router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    const filter = {};
    if (category && category !== 'все') {
      filter.category = category;
    }
    const projects = await Project.find(filter).sort({ year: -1 });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка при получении проектов' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Проект не найден' });
    res.json(project);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка при получении проекта' });
  }
});

router.post('/', auth, upload.any(), async (req, res) => {
  try {
    const { title, description = '', category, year } = req.body;

    const cover = req.files.find(f => f.fieldname === 'coverImage');
    const gallery = req.files.filter(f => f.fieldname === 'galleryImages');

    const newProject = new Project({
      title,
      description,
      category,
      year: parseInt(year),
      coverImage: cover ? `/uploads/covers/${cover.filename}` : '',
      galleryImages: gallery.map(f => `/uploads/gallery/${f.filename}`)
    });

    await newProject.save();
    res.status(201).json(newProject);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка при создании проекта' });
  }
});

router.put('/:id', auth, upload.any(), async (req, res) => {
  try {
    const { title, description = '', category, year, existingGallery } = req.body;

    const updateData = {
      title,
      description,
      category,
      year: parseInt(year)
    };

    const cover = req.files.find(f => f.fieldname === 'coverImage');
    const gallery = req.files.filter(f => f.fieldname === 'galleryImages');

    if (cover) {
      updateData.coverImage = `/uploads/covers/${cover.filename}`;
    }

    console.log('📥 body.existingGallery:', req.body.existingGallery);
    console.log('🖼 gallery files:', gallery.map(f => f.filename));

    const existing = existingGallery ? JSON.parse(existingGallery) : [];
    const newGallery = gallery.map(f => `/uploads/gallery/${f.filename}`);
    updateData.galleryImages = [...existing, ...newGallery];

    console.log('🧷 final galleryImages:', updateData.galleryImages);

    const updated = await Project.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updated) return res.status(404).json({ message: 'Проект не найден' });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка при обновлении проекта' });
  }
});

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
