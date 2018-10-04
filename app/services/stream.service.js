
const fs = require('fs')
const path = require('path')
const mkdirp = require('mkdirp')
const { ValidationError, ServiceNotAvailableError, RequestRejectedError, ServiceNotFoundError } = require('moleculer').Errors

module.exports = {
  name: 'stream',

  // mixins: [DbService],

  /**
   * Service settings
   */
  settings: {},

  /**
   * Service dependencies
   */
  dependencies: [],

  /**
   * Actions
   */
  actions: {
    async upload (ctx) {
      let fileInfo = {
        partname: ctx.meta.partname,
      }
      let files = await this.broker.call('filedb.findFiles', {
        fileInfo: fileInfo,
      })
      console.log(files)
      if (files.length > 0) {
        this.logger.error('File job name exist, no need to upload.')
        throw new RequestRejectedError('File job name exist, no need to upload.')
      }

      await this.mkdir(path.join(__dirname, '..', 'tmp'))
      // const filepath = path.join(__dirname, '..', 'tmp', ctx.meta.filename)
      const filepath = path.join(__dirname, '..', 'tmp', ctx.meta.partname)
      this.broker.call('filedb.createFileInfo', {
        filename: ctx.meta.filename,
        partname: ctx.meta.partname,
        filepath: filepath,
      })
      let fp = await this.receiveStream(ctx.params, filepath)
      return fp
    },

    getFile: {
      params: {
        partname: {
          type: 'string',
          empty: false,
        },
      },
      async handler (ctx) {
        let fileInfo = {
          partname: ctx.params.partname,
        }
        let files = await this.broker.call('filedb.findFiles', {
          fileInfo: fileInfo,
        })
        if (files.length < 1) {
          this.logger.error('File not found.')
          throw new new ServiceNotFoundError('File not found.')
        }

        ctx.meta.$responseType = 'video/mp4'
        ctx.meta.$location = '/' + files[0].filename
        return fs.createReadStream(files[0].filepath)
      },
    },
  },

  /**
   * Events
   */
  events: {},

  /**
   * Methods
   */
  methods: {
    mkdir (dir) {
      return new Promise((resolve, reject) => {
        mkdirp(dir, err => {
          if (err) reject(err)
          resolve()
        })
      })
    },
    receiveStream (stream, filepath) {
      return new Promise((resolve, reject) => {
        const s = fs.createWriteStream(filepath)
        stream.pipe(s)
        s.on('close', ()=> {
          resolve(filepath)
        })
      })
    },
  },

  afterConnected() {},

  /**
   * Service created lifecycle event handler
   */
  created() {},

  /**
   * Service started lifecycle event handler
   */
  started() {},

  /**
   * Service stopped lifecycle event handler
   */
  stopped() {},
}
