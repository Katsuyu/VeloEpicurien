FROM node:lts

COPY . /app
WORKDIR /app

RUN npm install --no-optional
RUN npm run build

EXPOSE $PORT

CMD [ "node", "dist/app/src/app.js" ]
