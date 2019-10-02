const request = require('request-promise');

const slackURL = process.env.SLACK_INCOMING_WEBHOOK_URL;

module.exports = {
  async sendPostToSlack(media) {
    if (!slackURL) {
      return;
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
            ts: Math.floor(Date.now() / 1000),
          }],
        },
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
    }
  },
};
