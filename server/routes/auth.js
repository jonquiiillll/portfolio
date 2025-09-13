// server/auth.js
'use strict';

const express = require('express');
const router = express.Router();

const ADMIN = {
  username: 'admin',
  password: 'password123'
};

// 🔑 Логин
router.post('/login', (req, res) => {
  console.log('📥 [LOGIN] Запрос получен');
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);

  const { username, password } = req.body || {};

  if (!username || !password) {
    console.log('⛔ Нет логина или пароля');
    return res.status(400).json({ message: 'Логин и пароль обязательны' });
  }

  if (username === ADMIN.username && password === ADMIN.password) {
    req.session.user = { username };
    console.log('✅ Вход успешен, сессия установлена:', req.session);
    return res.json({ ok: true });
  }

  console.log('❌ Неверный логин или пароль');
  res.status(401).json({ message: 'Ошибка входа' });
});

// 🚪 Логаут
router.post('/logout', (req, res) => {
  console.log('📤 [LOGOUT] Запрос получен');
  req.session.destroy(() => {
    console.log('🧼 Сессия уничтожена');
    res.clearCookie('connect.sid');
    res.json({ message: 'Выход выполнен' });
  });
});

module.exports = router;
