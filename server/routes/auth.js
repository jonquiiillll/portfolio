const express = require('express');
const router = express.Router();

const ADMIN = {
  username: 'admin',
  password: 'password123'
};

router.post('/login', (req, res) => {
  console.log('📥 [LOGIN] Запрос получен');

  if (!req.body) {
    console.log('⛔ Нет тела запроса (req.body is undefined)');
    return res.status(400).json({ message: 'Нет тела запроса' });
  }

  const { username, password } = req.body;
  console.log('🔑 Получены данные:', { username, password });

  if (username === ADMIN.username && password === ADMIN.password) {
    req.session.user = { username };
    console.log('✅ Вход успешен, сессия установлена:', req.session);
    return res.json({ ok: true });
  }

  console.log('❌ Неверный логин или пароль');
  res.status(401).json({ message: 'Ошибка входа' });
});

router.post('/logout', (req, res) => {
  console.log('📤 [LOGOUT] Запрос получен');
