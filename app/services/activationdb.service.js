const MongoClient = require('mongodb').MongoClient

module.exports = {
  name: 'activationdb',

  // mixins: [DbService],

  /**
   * Service settings
   */
  settings: {
    mongo: null,
    activationCollection: null,
  },

  /**
   * Service dependencies
   */
  dependencies: [],

  /**
   * Actions
   */
  actions: {
    createActivation: {
      params: {
        uuid: 'string',
        email: 'string',
        activationCode: 'string',
      },
      handler (ctx) {
        let activation = {
          uuid: ctx.params.uuid,
          email: ctx.params.email,
          activationCode: ctx.params.activationCode,
          status: 0, // 0--created, 1--used(activated)
        }
        return new Promise((resolve, reject) => {
          this.settings.activationCollection.insertOne(activation, (err, res) => {
            if (err) {
              this.logger.error(err)
              reject(err)
            }
            this.logger.info('1 activation inserted')
            resolve(res)
          })
        })
      },
    },

    findActivations: {
      params: {
        activation: 'object',
      },
      handler (ctx) {
        return new Promise((resolve, reject) => {
          this.settings.activationCollection.find(ctx.params.activation).toArray((err, res) => {
            if (err) {
              this.logger.error(err)
              reject(err)
            }
            resolve(res)
          })
        })
      },
    },

    updateActivation: {
      params: {
        oldActivation: 'object',
        activation: 'object',
      },
      handler (ctx) {
        let newvalue = {
          $set: ctx.params.activation,
        }
        return new Promise((resolve, reject) => {
          this.settings.activationCollection.updateOne(ctx.params.oldActivation, newvalue, (err, res) => {
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
        db.createCollection('activationdb', (e, r) => {
          if (err) {
            this.logger.error('Cannot create activation collection.')
            throw err
          }
          this.logger.info('Activation collection created!')
          this.settings.activationCollection = db.collection('activationdb')
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
