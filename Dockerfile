FROM node:17-alpine

WORKDIR /app

COPY . .

RUN npm i

EXPOSE 3001

CMD npm start