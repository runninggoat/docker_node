'use strict'

const fs = require('fs')
const path = require('path')
const ApiGateway = require('moleculer-web')
const multiparty = require('multiparty')

module.exports = {
  name: 'api',
  version: 1,
  mixins: [ApiGateway],

  // More info about settings: https://moleculer.services/docs/0.13/moleculer-web.html
  settings: {
    // Exposed port
    port: 8888,
    // Exposed IP
    ip: '0.0.0.0',
    // Exposed path prefix
    path: '/api',

    // HTTPS server with certificate
    https: {
      key: fs.readFileSync(path.join(__dirname, '..', 'cert', 'key.pem')),
      cert: fs.readFileSync(path.join(__dirname, '..', 'cert', 'cert.pem')),
    },

    routes: [
      {
        path: '/user',
        whitelist: [
          // Access to any actions in all services under "/api" URL
          '**',
        ],
        mappingPolicy: 'restrict',
        aliases: {
          'POST /create': 'user.create',
          'POST /requestActivatingUser': 'user.requestActivatingUser',
          'POST /activate': 'user.activate',
          'POST /signIn': 'user.signIn',
          'POST /verify': 'user.verify',
          'POST /version': 'user.version',
        },
        // Use bodyparser module to parse POST request body, otherwise you cannot get params of POST
        bodyParsers: {
          json: true,
          urlencoded: { extended: true },
        },
      },
      {
        path: '/stream',
        whitelist: ['**'],
        bodyParsers: {
          json: false,
          urlencoded: false,
        },
        mappingPolicy: 'restrict',
        aliases: {
          'GET /file': 'stream.getFile',
          'POST /upload' (req, res) {
            const form = new multiparty.Form()
            form.on('part', part => {
              if (part.name && part.filename) {
                this.logger.info('Part name: ', part.name)
                this.logger.info('File name: ', part.filename)
                return this.broker.call('stream.upload', part, {
                  meta: {
                    partname: part.name,
                    filename: part.filename,
                  },
                }).then(filePath => {
                  this.logger.info('File uploaded successfully!', filePath)
                  // this.sendRedirect(res, 'stream/upload?file=' + part.filename)
                  res.end('File uploaded successfully!')
                }).catch(err => {
                  this.logger.error('File upload error!!', err)
                  this.sendError(req, res, err)
                })
              }
            })
            form.parse(req)
          },
        },
      },
    ],

    // Serve assets from "public" folder
    assets: {
      folder: 'public',
    },
  },
}
