FROM node:8

# If you want this image to be product
# ENV NODE_ENV=production

WORKDIR /usr/src/app

# set domestic npm package management source
RUN npm config set registry https://registry.npm.taobao.org

RUN npm install -g moleculer --save &&\
    npm install -g moleculer-cli

EXPOSE 8888
