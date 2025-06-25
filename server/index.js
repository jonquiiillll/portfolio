const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const authenticateToken = require('./middleware/authMiddleware');

// 💡 вот здесь правильный путь:
const projectRoutes = require('./routes/projects');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Подключение к MongoDB
mongoose.connect('mongodb://localhost:27017/portfolio', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Мидлвары
app.use(cors());
app.use(express.json());

app.use('/uploads/covers', express.static(path.join(__dirname, 'uploads', 'covers')));
app.use('/uploads/gallery', express.static(path.join(__dirname, 'uploads', 'gallery')));

app.use('/assets', express.static(path.join(__dirname, '../assets')));
app.use(express.static(path.join(__dirname, '../client'))); // отдаём HTML

// Роуты
app.use('/api/projects', require('./routes/projects'));
app.use('/api/auth', require('./routes/auth'));

app.use('/api/projects', authenticateToken, require('./routes/projects'));

// Заглушка для всех остальных путей (например, если не SPA — можно убрать)
app.get('/:fileName', (req, res, next) => {
  const filePath = path.join(__dirname, '../client', req.params.fileName);
  res.sendFile(filePath, err => {
    if (err) {
      next(); // если файла нет — пропускаем дальше
    }
  });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
