// const DbService = require('moleculer-db')
// const mongo = require('mongodb')
const MongoClient = require('mongodb').MongoClient

module.exports = {
  name: 'userdb',

  // mixins: [DbService],

  /**
   * Service settings
   */
  settings: {
    mongo: null,
    collection: null,
  },

  /**
   * Service dependencies
   */
  dependencies: [],

  /**
   * Actions
   */
  actions: {
    /**
     * Create a user
     */
    createUser: {
      params: {
        uuid: 'string',
        email: 'string',
        passwordhash: 'string',
        salt: 'string',
        created: 'number',
      },
      async handler(ctx) {
        user = {
          uuid: ctx.params.uuid,
          email: ctx.params.email,
          passwordhash: ctx.params.passwordhash,
          salt: ctx.params.salt,
          created: ctx.params.created,
          status: 0, // default status of user, 0 -- created, 1 -- verified, -1 -- diabled
        }
        let resp = await this.addUser(user)
        return resp
      },
    },

    listUsers: {
      async handler(ctx) {
        let result = []
        result = await this.listAllUsers()
        this.logger.info(result)
        return result
      },
    },

    findUsers: {
      params: {
        user: 'object',
      },
      handler (ctx) {
        return new Promise((resolve, reject) => {
          this.settings.collection.find(ctx.params.user).toArray((err, res) => {
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
    addUser (user) {
      return new Promise((resolve, reject) => {
        this.settings.collection.insertOne(user, (err, res) => {
          if (err) {
            this.logger.error(err)
            reject(err)
          }
          this.logger.info('1 user inserted')
          resolve(res)
        })
      })
    },
    listAllUsers () {
      return new Promise((resolve, reject) => {
        this.settings.collection.find({}).toArray((err, res) => {
          if (err) {
            this.logger.error(err)
            reject(err)
          }
          resolve(res)
        })
      })
    },
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
        db.createCollection('userdb', (e, r) => {
          if (err) {
            this.logger.error('Cannot create collection.')
            throw err
          }
          this.logger.info('Collection created!')
          this.settings.collection = db.collection('userdb')
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
