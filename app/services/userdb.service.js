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
    userCollection: null,
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
          status: 0, // default status of user, 0 -- created, 1 -- verified, -1 -- disabled
        }
        return new Promise((resolve, reject) => {
          this.settings.userCollection.insertOne(user, (err, res) => {
            if (err) {
              this.logger.error(err)
              reject(err)
            }
            this.logger.info('1 user inserted')
            resolve(res)
          })
        })
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
          this.settings.userCollection.find(ctx.params.user).toArray((err, res) => {
            if (err) {
              this.logger.error(err)
              reject(err)
            }
            resolve(res)
          })
        })
      },
    },

    updateUser: {
      params: {
        oldUser: 'object',
        user: 'object',
      },
      handler (ctx) {
        let newvalues = {
          $set: ctx.params.user,
        }
        return new Promise((resolve, reject) => {
          this.settings.userCollection.updateOne(ctx.params.oldUser, newvalues, (err, res) => {
            if (err) {
              this.logger.error(err)
              reject(err)
            }
            resolve(res)
          })
        })
      },
    },

    createActivation: {
      params: {
        uuid: 'string',
        activationCode: 'string',
      },
      handler (ctx) {
        let activation = {
          uuid: ctx.params.uuid,
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
    listAllUsers () {
      return new Promise((resolve, reject) => {
        this.settings.userCollection.find({}).toArray((err, res) => {
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
            this.logger.error('Cannot create user collection.')
            throw err
          }
          this.logger.info('User collection created!')
          this.settings.userCollection = db.collection('userdb')
        })
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
