// server/index.js
'use strict';

const express = require('express');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const session = require('express-session');

const authRoutes = require('./routes/auth');

  // логин/логаут
const projectRoutes = require('./routes/projects'); // CRUD проектов

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const PROD = process.env.NODE_ENV === 'production';

// 💡 CORS — на проде подставляем домен, локально localhost:3000
app.use(cors({
  origin: PROD ? (process.env.CORS_ORIGIN || 'https://pavlova-interior.ru') : 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 💡 Сессии
if (PROD) app.set('trust proxy', 1);

app.use(session({
  secret: process.env.SESSION_SECRET || 'секрет',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: PROD,         // только по https на проде
    sameSite: PROD ? 'none' : 'lax',
    path: '/',
    domain: PROD ? 'pavlova-interior.ru' : undefined,
    maxAge: 1000 * 60 * 60 * 24 // сутки
  }
}));

// 💡 Статика
app.use('/uploads/covers', express.static(path.join(__dirname, 'uploads', 'covers')));
app.use('/uploads/gallery', express.static(path.join(__dirname, 'uploads', 'gallery')));
app.use('/assets', express.static(path.join(__dirname, '../assets')));
app.use('/components', express.static(path.join(__dirname, '../client/components')));
app.use(express.static(path.join(__dirname, '../client')));

// 💡 Роуты
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);

app.get('/api/checkSession', (req, res) => {
  res.json({ sessionExists: !!req.session.user });
});

// 💡 Фоллбэк для SPA
app.get('/:fileName', (req, res, next) => {
  const filePath = path.join(__dirname, '../client', req.params.fileName);
  res.sendFile(filePath, err => {
    if (err) next();
  });
});

app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
