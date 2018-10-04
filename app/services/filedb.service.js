const MongoClient = require('mongodb').MongoClient

module.exports = {
  name: 'filedb',

  // mixins: [DbService],

  /**
   * Service settings
   */
  settings: {
    mongo: null,
    fileCollection: null,
  },

  /**
   * Service dependencies
   */
  dependencies: [],

  /**
   * Actions
   */
  actions: {
    createFileInfo: {
      params: {
        filename: 'string',
        partname: 'string',
        filepath: 'string',
      },
      handler (ctx) {
        let fileInfo = {
          filename: ctx.params.filename,
          partname: ctx.params.partname,
          filepath: ctx.params.filepath,
        }
        return new Promise((resolve, reject) => {
          this.settings.fileCollection.insertOne(fileInfo, (err, res) => {
            if (err) {
              this.logger.error(err)
              reject(err)
            }
            this.logger.info('1 file info inserted')
            resolve(res)
          })
        })
      },
    },

    findFiles: {
      params: {
        fileInfo: 'object',
      },
      handler (ctx) {
        return new Promise((resolve, reject) => {
          this.settings.fileCollection.find(ctx.params.fileInfo).toArray((err, res) => {
            if (err) {
              this.logger.error(err)
              reject(err)
            }
            resolve(res)
          })
        })
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
  },

  afterConnected() {
    // Seed the DB with ˙this.create`
  },

  /**
   * Service created lifecycle event handler
   */
  created() {},

  /**
   * Service started lifecycle event handler
   */
  started() {
    const url = process.env.MONGO_URL
    MongoClient.connect(url, (err, db) => {
        if (err) {
          this.logger.error('Cannot connect to Mongo.')
          throw err
        }
        this.logger.info('Database created!')
        this.settings.mongo = db
        db = db.db('holly')
        db.createCollection('filedb', (e, r) => {
          if (err) {
            this.logger.error('Cannot create file collection.')
            throw err
          }
          this.logger.info('File collection created!')
          this.settings.fileCollection = db.collection('filedb')
        })
      },
    )
  },

  /**
   * Service stopped lifecycle event handler
   */
  stopped() {
    this.logger.info('Closing Mongo DB.')
    this.settings.mongo.close()
  },
}
