'use strict'

const fs = require("fs")
const path = require("path")
const ApiGateway = require('moleculer-web')

module.exports = {
  name: 'api',
  version: 1,
  mixins: [ApiGateway],

  // More info about settings: https://moleculer.services/docs/0.13/moleculer-web.html
  settings: {
    // port: process.env.PORT || 3000,
    port: 8888,

    // HTTPS server with certificate
    https: {
      key: fs.readFileSync(path.join(__dirname, '..', 'cert', 'key.pem')),
      cert: fs.readFileSync(path.join(__dirname, '..', 'cert', 'cert.pem')),
    },

    routes: [
      {
        path: '/api',
        whitelist: [
          // Access to any actions in all services under "/api" URL
          '**',
        ],
        mappingPolicy: 'restrict',
        aliases: {
          'POST user/create': 'user.create',
          'POST user/requestActivatingUser': 'user.requestActivatingUser',
          'POST user/activate': 'user.activate',
          'POST user/signIn': 'user.signIn',
          'POST user/verify': 'user.verify',
          'POST user/version': 'user.version',
        },
        // Use bodyparser module to parse POST request body, otherwise you cannot get params of POST
        bodyParsers: {
          json: true,
          urlencoded: { extended: true },
        },
      },
    ],

    // Serve assets from "public" folder
    assets: {
      folder: 'public',
    },
  },
}
