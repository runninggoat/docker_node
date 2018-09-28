const DbService = require('moleculer-db')

module.exports = {
  name: 'userdb',

  mixins: [DbService],

  /**
   * Service settings
   */
  settings: {
    fields: ['_id', 'email', 'status', ],
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
      handler (ctx) {
        let user = {
          email: ctx.params.email,
          status: 0,
        }
        this.broker.call('userdb.create', user).then(rows => {
          return rows
        })
      },
    },
    listUsers: {
      async handler (ctx) {
        let result = []
        await this.broker.call('userdb.list').then(res => {
          this.logger.info(res)
          result = res
        })
        console.log(result)
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
  methods: {},

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
  started() {},

  /**
   * Service stopped lifecycle event handler
   */
  stopped() {},
}
