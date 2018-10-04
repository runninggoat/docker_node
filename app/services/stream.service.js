
const fs = require('fs')
const path = require('path')
const mkdirp = require('mkdirp')

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
      await this.mkdir(path.join(__dirname, '..', 'tmp'))
      // const filepath = path.join(__dirname, '..', 'tmp', ctx.meta.filename)
      const filepath = path.join(__dirname, '..', 'tmp', ctx.meta.partname)
      let fp = await this.receiveStream(ctx.params, filepath)
      return fp
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
