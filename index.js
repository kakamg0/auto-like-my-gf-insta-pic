require('dotenv').config();
const express = require('express');
const instagram = require('./helpers/instagram');

const app = express();

app.get('/auth/instagram', (req, res) => {
  res.redirect(instagram.getAuthorizationUrl());
});

app.get('/auth/instagram/callback', async (req, res) => {
  try {
    const data = await instagram.authorizeUser(req.query.code);
    res.json({ ok: true, data });
  } catch (err) {
    res.status(500).json({ ok: false, error });
  }
});

app.get('/run', async (req, res) => {
  try {
    instagram.likeRecentMedia();
    res.json({ ok: true, data: {} });
  } catch (error) {
    res.status(500).json({ ok: false, error });
  }
});

app.set('port', process.env.PORT || 3000);
app.listen(app.get('port'));
