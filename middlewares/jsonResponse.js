const cookie = require("cookie");
const errors = require("../utils/httpErrors");

export const jsonResponse = () => {
  const successJSONResponse = (handler) => {
    let setCookies;
    if (handler.event.extraData) {
      setCookies = handler.event.extraData.setCookies;
    }

    // 1- Add application/json headers
    let response = { headers: handler.response.headers };
    response.headers["Content-Type"] = "application/json";

    // 3- Remove headers from response body
    delete handler.response.headers;

    // 4- Adds cookies to response if needed
    if (handler.response.cookies || setCookies) {
      response = {
        ...response,
        multiValueHeaders: {
          "Set-Cookie": [],
        },
      };

      if (handler.response.cookies) {
        for (var cookieObj of handler.response.cookies) {
          response.multiValueHeaders["Set-Cookie"].push(
            cookie.serialize(cookieObj.name, cookieObj.value, cookieObj.options)
          );
        }

        // 5 - Delete cookies object
        delete handler.response.cookies;
      }
      if (setCookies) {
        for (var authCookie of setCookies) {
          response.multiValueHeaders["Set-Cookie"].push(
            cookie.serialize(
              authCookie.name,
              authCookie.value,
              authCookie.options
            )
          );
        }
      }
    }

    // 5 - Parse body
    response.body = JSON.stringify(handler.response);

    // 6- Set response status code
    response.statusCode = 200;

    // 7- Set response
    handler.response = response;
  };

  const errorJSONResponse = (handler) => {
    //If it's an unhandled exception, fill the response with an unexpected error object
    if (handler.error && !handler.response) {
      console.error("Unhandled exception found: ");
      console.error(handler.error);

      const errorResponse = {
        statusCode: 500,
        body: errors.serverErrorBody,
      };

      handler.response = errorResponse;
    }
  };

  return {
    after: successJSONResponse,
    onError: errorJSONResponse,
  };
};
