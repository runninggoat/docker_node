"use strict";

module.exports = {
  name: "user",

  /**
   * Service settings
   */
  settings: {},

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
        email: { type: "string" }
      },
      handler(ctx) {
        this.logger.info(ctx.params);
        let res = {
          statusCode: 200,
          statusMessage: "get email: " + ctx.params.email
        };
        return res;
      }
    }
  },

  /**
   * Events
   */
  events: {},

  /**
   * Methods
   */
  methods: {},

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
  stopped() {}
};
