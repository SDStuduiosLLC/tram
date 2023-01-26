FROM node:19.4-buster-slim

WORKDIR /build

COPY package*.json yarn.lock ./

RUN yarn install

COPY . .

EXPOSE 8080

CMD yarn run start