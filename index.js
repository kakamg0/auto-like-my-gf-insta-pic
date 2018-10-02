require('dotenv').config();

const userID = process.env.USER_ID_TO_MONITOR;
const slackURL = process.env.SLACK_INCOMING_WEBHOOK_URL;

const Instagram = require('node-instagram').default;
const request = require('request-promise');

const instagram = new Instagram({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET
});

const express = require('express');
const app = express();

async function sendPostToSlack(media) {
  if (!slackURL) {
    return
  }
  try {
    const caption = media.caption === null ? 'Unknown' : media.caption.text;
    await request.post(slackURL, {
      json: {
        attachments: [{
          pretext: caption,
          image_url: media.images.standard_resolution.url,
          footer: `Instagram ${media.type} liked`,
          footer_icon: 'https://lh3.googleusercontent.com/aYbdIM1abwyVSUZLDKoE0CDZGRhlkpsaPOg9tNnBktUQYsXflwknnOn2Ge1Yr7rImGk=w300',
          ts: Math.floor(Date.now() / 1000)
        }]
      }
    });
  } catch (err) {
    console.error(err);
  }
}

// Your redirect url where you will handle the code param
const redirectUri = 'http://localhost:3000/auth/instagram/callback';

app.get('/auth/instagram', (req, res) => {
  res.redirect(instagram.getAuthorizationUrl(redirectUri, { scope: [ 'basic' ] }));
});

app.get('/auth/instagram/callback', async (req, res) => {
  try {
    const code = req.query.code;
    const data = await instagram.authorizeUser(code, redirectUri);
    instagram.config.accessToken = data.access_token;
    res.json(data);
  } catch (err) {
    res.json(err);
  }
});

app.get('/run', async (req, res) => {
  try {
    const result = await instagram.get(`users/${userID}/media/recent`);
    const likePromise = [];
    result.data.forEach(({ id, user_has_liked: userHasLiked }) => {
      if (!userHasLiked) {
        likePromise.push(instagram.post(`media/${id}/likes`).then(() => sendPostToSlack(media)));
      }
    });
    if (likePromise.length > 0) {
      await Promise.all(likePromise);
    }
    res.json({ ok: true });
  } catch (err) {
    res.json({ ok: false, error: err });
  }
});

app.set('port', process.env.PORT || 3000);
app.listen(app.get('port'));
