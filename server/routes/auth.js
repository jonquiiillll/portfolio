const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Заменить на .env и нормальную систему хранения паролей в продакшене
const ADMIN = {
  username: 'admin',
  password: 'password123'
};

router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (username === ADMIN.username && password === ADMIN.password) {
    const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return res.json({ token });
  }

  res.status(401).json({ message: 'Неверные учетные данные' });
});

module.exports = router;
