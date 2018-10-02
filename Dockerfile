FROM node:10-alpine

EXPOSE 3000

WORKDIR /usr/src/app

COPY . .

RUN npm i --production

CMD [ "node", "index.js" ]

