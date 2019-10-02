const slack = require('./slack');
const Instagram = require('node-instagram').default;

const userID = process.env.USER_ID_TO_MONITOR;
const redirectUri = 'http://localhost:3000/auth/instagram/callback';

const instagram = new Instagram({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
});

module.exports = {
  getAuthorizationUrl() {
    return instagram.getAuthorizationUrl(redirectUri, { scope: ['basic'] });
  },
  async authorizeUser(code) {
    const data = await instagram.authorizeUser(code, redirectUri);
    instagram.config.accessToken = data.access_token;
    return data;
  },
  async likeRecentMedia() {
    const result = await instagram.get(`users/${userID}/media/recent`);
    const promises = result.data.map(async (media) => {
      if (!media.user_has_liked) {
        await instagram.post(`media/${media.id}/likes`);
        await slack.sendPostToSlack(media);
      }
    });
    await Promise.all(promises);
  },
};
