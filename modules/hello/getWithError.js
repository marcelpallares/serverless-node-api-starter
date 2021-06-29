const middy = require("@middy/core");
const jsonBodyParser = require("@middy/http-json-body-parser");
const errorHandler = require("@middy/http-error-handler");
const securityHeaders = require("@middy/http-security-headers");
const doNotWaitForEmptyEventLoop = require("@middy/do-not-wait-for-empty-event-loop");
const { jsonResponse } = require("../../middlewares/jsonResponse");
const throwError = require("../../utils/httpErrors");

const customHandler = async (event) => {
  throwError.customErrorForbidden();
  return null;
};

export const handler = middy(customHandler)
  .use(jsonBodyParser())
  .use(errorHandler())
  .use(jsonResponse())
  .use(securityHeaders())
  .use(
    doNotWaitForEmptyEventLoop({
      runOnAfter: true,
      runOnError: true,
    })
  );
