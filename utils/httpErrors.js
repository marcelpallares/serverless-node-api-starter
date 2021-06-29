const error = require("http-errors");

export const serverErrorBody = JSON.stringify({
  code: "SERVER_ERROR",
  message: "Unexpected server error.",
});

export const serverError = () => {
  throw new error.InternalServerError(serverErrorBody);
};

export const customErrorForbidden = () => {
  throw new error.Forbidden(
    JSON.stringify({
      code: "CUSTOM_CODE_FORBIDDEN",
      message: "This is a custom message manually added in the project.",
    })
  );
};
