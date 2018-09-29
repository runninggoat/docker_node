// const DbService = require('moleculer-db')
// const mongo = require('mongodb')
const MongoClient = require('mongodb').MongoClient
const { RequestRejectedError } = require('moleculer').Errors

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
        email: 'string',
        password: 'string',
      },
      async handler(ctx) {
        const now = new Date()
        let user = {
          email: ctx.params.email,
        }
        let existUsers = await this.findUsers(user)
        this.logger.info(existUsers)
        if (existUsers.length > 0) {
          this.logger.error('User exist, cannot register again.')
          throw new RequestRejectedError('User exist, cannot register again.')
        }
        user = {
          email: ctx.params.email,
          password: ctx.params.password,
          created: now.getTime(),
          status: 0,
        }
        let resp = await this.addUser(user)
        return resp
      },
    },

    /**
     * Create a user
     */
    signInUser: {
      params: {
        email: 'string',
        password: 'string',
      },
      async handler(ctx) {
        const now = new Date()
        let user = {
          email: ctx.params.email,
          password: ctx.params.password,
        }
        let existUsers = await this.findUsers(user)
        if (existUsers.length < 1) {
          this.logger.error('User does not exist.')
          throw new RequestRejectedError('User does not exist.')
        }
        return existUsers
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
  },

  /**
   * Events
   */
  events: {},

  /**
   * Methods
   */
  methods: {
    findUsers (user) {
      return new Promise((resolve, reject) => {
        this.settings.collection.find(user).toArray((err, res) => {
          if (err) {
            this.logger.error(err)
            reject(err)
          }
          resolve(res)
        })
      })
    },
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
