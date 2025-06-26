const express = require('express');
const router = express.Router();

const ADMIN = {
  username: 'admin',
  password: 'password123'
};

router.post('/login', (req, res) => {
  console.log('Before login:', req.session);
  req.session.user = { username: req.body.username };
  console.log('After login:', req.session);
  res.json({ ok: true });
});



router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.json({ message: 'Выход выполнен' });
  });
});

module.exports = router;
