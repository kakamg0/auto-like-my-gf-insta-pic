const slack = require('./helpers/slack');
const Instagram = require('node-instagram').default;
const userID = process.env.USER_ID_TO_MONITOR;
const redirectUri = 'http://localhost:3000/auth/instagram/callback';

const instagram = new Instagram({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET
});

module.exports = {
  getAuthorizationUrl,
  authorizeUser,
  likeRecentMedia
}

function getAuthorizationUrl () {
  return instagram.getAuthorizationUrl(redirectUri, { scope: [ 'basic' ] });
}


async function authorizeUser (code) {
  const data = await instagram.authorizeUser(code, redirectUri);
  instagram.config.accessToken = data.access_token;
  return data;
}

async function likeRecentMedia () {
  const result = await instagram.get(`users/${userID}/media/recent`);
  const promises = result.data.map(async ({ id, user_has_liked: userHasLiked }) => {
    if (!userHasLiked) {
      await instagram.post(`media/${id}/likes`);
      await slack.sendPostToSlack(media);
    }
  });
  await Promise.all(promises);
}
