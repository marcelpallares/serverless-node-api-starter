const middy = require("@middy/core");
const jsonBodyParser = require("@middy/http-json-body-parser");
const errorHandler = require("@middy/http-error-handler");
const securityHeaders = require("@middy/http-security-headers");
const cors = require("@middy/http-cors");
const doNotWaitForEmptyEventLoop = require("@middy/do-not-wait-for-empty-event-loop");
const { jsonResponse } = require("../../middlewares/jsonResponse");
const { CORSConfig } = require("../../utils/helpers");

const customHandler = async (event) => {
  return {
    message: "Hello with CORS!"
  };
};

export const handler = middy(customHandler)
  .use(jsonBodyParser())
  .use(errorHandler())
  .use(jsonResponse())
  .use(securityHeaders())
  .use(cors(CORSConfig))
  .use(
    doNotWaitForEmptyEventLoop({
      runOnAfter: true,
      runOnError: true,
    })
  );
