const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const session = require('express-session');

const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 💡 Доверять proxy, чтобы secure cookie работала за HTTPS
app.set('trust proxy', 1);

// 💡 CORS — на проде подставь свой домен
app.use(cors({
  origin: 'https://pavlova-interior.ru', // продакшн домен
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 💡 Сессии
app.set('trust proxy', 1);

app.use(session({
  secret: process.env.SESSION_SECRET || 'секрет',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: true,          // ⚠️ true, так как HTTPS
    sameSite: 'none',      // ⚠️ нужно для HTTPS + кросс-домен
    maxAge: 1000 * 60 * 60 * 24 // сутки
  }
}));

// 💡 Подключение к MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB подключена'))
  .catch(err => console.error('❌ Ошибка подключения к MongoDB:', err));

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

// 💡 Фоллбэк для HTML
app.get('/:fileName', (req, res, next) => {
  const filePath = path.join(__dirname, '../client', req.params.fileName);
  res.sendFile(filePath, err => {
    if (err) {
      next();
    }
  });
});

app.listen(PORT, () => {
  console.log(`✅ Server is running on https://pavlova-interior.ru`);
});
