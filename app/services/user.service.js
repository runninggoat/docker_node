// const base64 = require('js-base64').Base64
const request = require('request')
const { ValidationError, ServiceNotAvailableError, RequestRejectedError } = require('moleculer').Errors
const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const md5 = require('md5')
const uuidv1 = require('uuid/v1')

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
        const now = new Date()
        let user = {
          email: ctx.params.email,
        }
        let existUsers = await this.broker.call('userdb.findUsers', {
          user: user,
        })
        this.logger.info(existUsers)
        if (existUsers.length > 0) {
          this.logger.error('User exist, cannot register again.')
          throw new RequestRejectedError('User exist, cannot register again.')
        }

        // Generate salt hash password string
        const salt = await this.genRandomString(16)
        const pwhash = md5(ctx.params.password + salt)
        const uuid = uuidv1()
        let res = await this.broker.call('userdb.createUser', {
          uuid: uuid,
          email: ctx.params.email,
          passwordhash: pwhash,
          salt: salt,
          created: now.getTime(),
        })
        return res
      },
    },

    requestActivatingUser: {
      params: {
        uuid: {
          type: 'string',
          empty: false,
        },
      },
      async handler (ctx) {
        this.logger.info(ctx.options.parentCtx.params.req.headers.host) // get host (ip and port)
        let user = {
          uuid: ctx.params.uuid,
        }
        let existUsers = await this.broker.call('userdb.findUsers', {
          user: user,
        })
        if (existUsers.length < 1) {
          this.logger.error('User does not exist.')
          throw new RequestRejectedError('User does not exist.')
        }
        let existUser = existUsers[0]

        if (existUser.status === -1) {
          this.logger.error('User is disabled.')
          throw new RequestRejectedError('User is disabled.')
        }

        if (existUser.status !== 0) {
          this.logger.error('User does not need to activate.')
          throw new RequestRejectedError('User does not need to activate.')
        }

        let activation = {
          uuid: ctx.params.uuid,
        }
        let existActivations = await this.broker.call('userdb.findActivations', {
          activation: activation,
        })
        console.log(existActivations)
        if (existActivations.length > 0) {
          this.logger.error('You have requested activation.')
          throw new RequestRejectedError('You have requested activation.')
        }
        // Generate 6 digits random number for account activation
        let activationCode = Math.round(Math.random() * 1e6)
        activationCode = activationCode.toString()
        let resp = await this.broker.call('userdb.createActivation', {
          uuid: ctx.params.uuid,
          activationCode: activationCode,
        })
        // Send this code via email
        // return the status of the email sending
        return resp
      },
    },

    activate: {
      params: {
        uuid: {
          type: 'string',
          empty: false,
        },
        activationCode: {
          type: 'string',
          empty: false,
        },
      },
      async handler (ctx) {
        this.logger.info(ctx.params)
        let user = {
          uuid: ctx.params.uuid,
        }
        let existUsers = await this.broker.call('userdb.findUsers', {
          user: user,
        })
        if (existUsers.length < 1) {
          this.logger.error('User does not exist.')
          throw new RequestRejectedError('User does not exist.')
        }
        let existUser = existUsers[0]

        if (existUser.status === -1) {
          this.logger.error('User is disabled.')
          throw new RequestRejectedError('User is disabled.')
        }

        if (existUser.status !== 0) {
          this.logger.error('User does not need to activate.')
          throw new RequestRejectedError('User does not need to activate.')
        }

        let activation = {
          uuid: ctx.params.uuid,
          activationCode: ctx.params.activationCode,
        }
        let existActivations = await this.broker.call('userdb.findActivations', {
          activation: activation,
        })
        if (existActivations.length < 1) {
          this.logger.error('You have not requested activation yet.')
          throw new RequestRejectedError('You have not requested activation yet.')
        }

        let newActivation = JSON.parse(JSON.stringify(existActivations[0]))
        delete newActivation['_id']
        newActivation.status = 1
        let resp = await this.broker.call('userdb.updateActivation', {
          oldActivation: existActivations[0],
          activation: newActivation,
        })
        let newUser = JSON.parse(JSON.stringify(existUser))
        delete newUser['_id']
        newUser.status = 1
        resp = await this.broker.call('userdb.updateUser', {
          oldUser: existUser,
          user: newUser,
        })
        return resp
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
        const now = new Date()
        let user = {
          email: ctx.params.email,
        }
        let existUsers = await this.broker.call('userdb.findUsers', {
          user: user,
        })

        if (existUsers.length < 1) {
          this.logger.error('User does not exist.')
          throw new RequestRejectedError('User does not exist.')
        }
        let existUser = existUsers[0]

        if (existUser.status === -1) {
          this.logger.error('User is disabled.')
          throw new RequestRejectedError('User is disabled.')
        }

        if (existUser.status === 0) {
          this.logger.error('User is not activated.')
          throw new RequestRejectedError('User is not activated.')
        }

        // Get salt and validate with the hashed password
        const pwhashAttemp = md5(ctx.params.password + existUser.salt)
        if (pwhashAttemp !== existUser.passwordhash) {
          this.logger.error('Password does not match.')
          throw new RequestRejectedError('Password does not match.')
        }
        const webToken = jwt.sign({
          exp: Math.floor(Date.now() / 1000) + parseInt(process.env.JWTEXPIRE),
          data: existUser.uuid,
        }, process.env.JWTSECRET)
        let resp = {
          statusCode: 200,
          uuid: existUser.uuid,
          wt: webToken,
        }
        return resp
      },
    },

    verify: {
      params: {
        uuid: {
          type: 'string',
          empty: false,
        },
        webToken: {
          type: 'string',
          empty: false,
        },
      },
      async handler (ctx) {
        this.logger.info(ctx.params)
        // invalid token - synchronous
        let decoded
        try {
          decoded = jwt.verify(ctx.params.webToken, process.env.JWTSECRET)
        } catch(err) {
          // err
          throw new RequestRejectedError('You are not authenticated.')
        }
        if (decoded.data !== ctx.params.uuid) {
          throw new RequestRejectedError('You are not authenticated.')
        }
        return {
          statusCode: 200,
          uuid: decoded.data,
        }
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

    /**
     * generates random string of characters i.e salt
     * @function
     * @param {number} length - Length of the random string.
     */
    genRandomString (length) {
      return crypto.randomBytes(Math.ceil(length/2))
              .toString('hex') /** convert to hexadecimal format */
              .slice(0,length) /** return required number of characters */
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
