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
app.set('trust proxy', 1);


app.use(cors({ origin: 'http://localhost:5000', credentials: true }));
app.use(express.json());

const PORT = process.env.PORT || 5000;
app.use(session({
  secret: process.env.SESSION_SECRET || 'секрет',
  resave: true,              // Сохранять сессию каждый раз — помогает при нестабильном store
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 24
  }
}));

// Подключение к MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Мидлвары
app.use(cors({
  origin: 'http://localhost:5000',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Сессии



// Статика
app.use('/uploads/covers', express.static(path.join(__dirname, 'uploads', 'covers')));
app.use('/uploads/gallery', express.static(path.join(__dirname, 'uploads', 'gallery')));
app.use('/assets', express.static(path.join(__dirname, '../assets')));
app.use('/components', express.static(path.join(__dirname, '../client/components')));
app.use(express.static(path.join(__dirname, '../client')));

// Роуты
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);

app.get('/api/checkSession', (req, res) => {
  res.json({ sessionExists: !!req.session.user });
});


// Фоллбэк для HTML (если не SPA, можно адаптировать)
app.get('/:fileName', (req, res, next) => {
  const filePath = path.join(__dirname, '../client', req.params.fileName);
  res.sendFile(filePath, err => {
    if (err) {
      next();
    }
  });
});

// Запуск
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
