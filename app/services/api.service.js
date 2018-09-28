'use strict'

const ApiGateway = require('moleculer-web')

module.exports = {
  name: 'api',
  mixins: [ApiGateway, ],

  // More info about settings: https://moleculer.services/docs/0.13/moleculer-web.html
  settings: {
    // port: process.env.PORT || 3000,
    port: 8888,

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
          'POST user/mailStatus': 'user.mailStatus',
          'POST userdb/listUsers': 'userdb.listUsers',
        },
        // Use bodyparser module to parse POST request body, otherwise you cannot get params of POST
        bodyParsers: {
          json: true,
          urlencoded: { extended: true, },
        },
      },
    ],

    // Serve assets from "public" folder
    assets: {
      folder: 'public',
    },
  },
}
