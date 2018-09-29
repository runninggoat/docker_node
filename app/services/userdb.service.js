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
     * Say a 'Hello'
     *
     * @returns
     */
    createUser: {
      params: {
        email: {
          type: 'string',
        },
      },
      async handler(ctx) {
        let user = {
          email: ctx.params.email,
          status: 0,
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
          if (err) this.logger.error(err)
          this.logger.info('1 user inserted')
          resolve(res)
        })
      })
    },
    listAllUsers () {
      return new Promise((resolve, reject) => {
        this.settings.collection.find({}).toArray((err, res) => {
          if (err) this.logger.error(err)
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
    const url = 'mongodb://node_mongo:27017/holly'
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
