// const base64 = require('js-base64').Base64
const request = require('request')
const md5 = require('md5')
const { ValidationError, ServiceNotAvailableError, RequestRejectedError } = require('moleculer').Errors

module.exports = {
  name: 'user',

  /**
   * Service settings
   */
  settings: {
  },

  /**
   * Service dependencies
   */
  dependencies: [
    // 'userdb',
  ],

  /**
   * Actions
   */
  actions: {
    /**
     * Create a user
     *
     * @param {String} email - E-mail of the user
     * @param {String} password - Password of the user
     */
    create: {
      params: {
        email: {
          type: 'string',
          empty: false,
          pattern: /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/,
        },
        password: {
          type: 'string',
          empty: false,
          pattern: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,}$/,
        },
      },
      async handler(ctx) {
        this.logger.info(ctx.params)
        let res = await this.broker.call('userdb.createUser', {
          email: ctx.params.email,
          password: ctx.params.password,
        })
        return res
      },
    },

    /**
     * Sign in a user
     *
     * @param {String} email - E-mail of the user
     * @param {String} password - Password of the user
     */
    signIn: {
      params: {
        email: {
          type: 'string',
          empty: false,
          pattern: /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/,
        },
        password: {
          type: 'string',
          empty: false,
          pattern: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,}$/,
        },
      },
      async handler(ctx) {
        this.logger.info(ctx.params)
        let res = await this.broker.call('userdb.signInUser', {
          email: ctx.params.email,
          password: ctx.params.password,
        })
        return res
      },
    },

    /**
     * Return the version of the API
     */
    version (ctx) {
      return {
        version: 'v1.0',
      }
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
    generateJobId () {
      // create jobid here, jobid contains timestamp, userID and a random number in 8 digits
      let jobId = new Date().getTime() + '-' + Math.round(Math.random() * 1e8)
      // console.log(jobId)
      jobId = md5(jobId)
      // console.log(this.jobid)
      return jobId
    },
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
