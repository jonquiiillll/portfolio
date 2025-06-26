module.exports = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  }
  res.status(401).json({ message: 'Unauthorized' });
  router.post('/login', (req, res) => {
  req.session.user = { username: req.body.username };
  console.log('Session set:', req.session);
  res.json({ message: 'ok' });
});

};

