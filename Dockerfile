FROM node:8

# If you want this image to be product
# ENV NODE_ENV=production

# USER node

WORKDIR /usr/src/app

RUN npm install -g moleculer --save &&\
    npm install -g moleculer-cli

EXPOSE 8888
