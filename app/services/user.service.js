// const base64 = require('js-base64').Base64
const request = require('request')
const md5 = require('md5')
const { ValidationError, ServiceNotAvailableError, RequestRejectedError, } = require('moleculer').Errors

module.exports = {
  name: 'user',

  /**
   * Service settings
   */
  settings: {
    // mail task status, 0 -- created, 1 -- success, 2 -- fail
    mailTask: {},
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
     *
     * @param {String} email - E-mail of the user
     */
    create: {
      params: {
        email: {
          type: 'string',
        },
      },
      handler(ctx) {
        this.logger.info(ctx.params)
        let mailTaskId = this.sendSecretKeyEmail(ctx.params.email, '1a2C3sk')
        this.logger.info(mailTaskId)
        if (!mailTaskId) {
          throw new RequestRejectedError('Sending E-mail service is not available.')
        }
        return this.generateMailTaskStatusResp(mailTaskId)
      },
    },
    mailStatus: {
      params: {
        mailTaskId: {
          type: 'string',
        },
      },
      handler (ctx) {
        let mailTaskId = ctx.params.mailTaskId
        if (!mailTaskId) {
          throw new ValidationError('Cannot find E-mail record.')
        }
        return this.generateMailTaskStatusResp(mailTaskId)
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
    sendSecretKeyEmail(destination, secretkey) {
      let xsmtpapi = {
        to: [
          destination,
        ],
        sub: {
          '%secretkey%': [
            secretkey,
          ],
        },
      }
      xsmtpapi = JSON.stringify(xsmtpapi)
      // xsmtpapi = base64.encode(xsmtpapi) // don't use base64 encode according to official doc
      this.logger.info(xsmtpapi)
      let requestData = {
        apiUser: 'runninggoat_test_bkI7jz',
        apiKey: 'JEiT8t4cJmrFpSXE',
        from: '1501832474@qq.com',
        fromName: 'Unitylabs',
        to: '1501832474@qq.com',
        // subject: 'send email from sendcloud',
        // html: 'let us have a try ' + ctx.params.email,
        // contentSummary: 'content summary',
        xsmtpapi: xsmtpapi,
        templateInvokeName: 'secretkey',
      }
      // const url = 'http://api.sendcloud.net/apiv2/mail/send'
      const url = 'http://api.sendcloud.net/apiv2/mail/sendtemplate'
      const mailTaskId = this.generateJobId()
      this.settings.mailTask[mailTaskId] = 0
      request.post({  url: url, form: requestData,  }, (error, response, body) => {
        if (!error && response.statusCode == 200) {
          console.log('sending email successfully')
          console.log(body)
          this.settings.mailTask[mailTaskId] = 1
        } else {
          console.log(error)
          this.settings.mailTask[mailTaskId] = 2
        }
      })
      return mailTaskId
    },
    generateJobId () {
      // create jobid here, jobid contains timestamp, userID and a random number in 8 digits
      let jobId = new Date().getTime() + '-' + Math.round(Math.random() * 1e8)
      // console.log(jobId)
      jobId = md5(jobId)
      // console.log(this.jobid)
      return jobId
    },
    generateMailTaskStatusResp (mailTaskId) {
      const res = {
        statusCode: 200,
        statusMessage: {
          mailTaskId: mailTaskId,
          status: this.settings.mailTask[mailTaskId],
        },
      }
      return res
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