
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
      // console.log(ctx.options.parentCtx.params.req)
      const s = fs.createWriteStream(path.join(__dirname, '..', 'tmp', ctx.meta.filename))
      ctx.params.pipe(s)
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
