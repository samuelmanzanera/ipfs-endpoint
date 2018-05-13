FROM node:9.11-alpine
ENV NODE_ENV production
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN apk update && apk add --no-cache --virtual python make gcc g++
RUN npm install --production
RUN apk del build-dependencies
COPY . .
EXPOSE 8082
EXPOSE 8081
EXPOSE 5001
CMD npm start