export const getValidationSchema = (
  bodySchema,
  mandatoryParams,
  headersSchema,
  mandatoryHeaders
) => {
  if (bodySchema) {
    return {
      type: "object",
      properties: {
        body: getBody(bodySchema, mandatoryParams),
        headers: getHeaders(headersSchema, mandatoryHeaders),
      },
      required: ["body", "headers"],
    };
  } else {
    return {
      type: "object",
      properties: {
        headers: getHeaders(headersSchema, mandatoryHeaders),
      },
      required: ["headers"],
    };
  }
};

export const getQueryValidationSchema = (
  querySchema,
  mandatoryParams,
  headersSchema,
  mandatoryHeaders
) => {
  return {
    type: "object",
    properties: {
      queryStringParameters: getQueryParams(querySchema, mandatoryParams),
      headers: getHeaders(headersSchema, mandatoryHeaders),
    },
    required: ["queryStringParameters", "headers"],
  };
};

export const getHeaders = (customHeaders, customMandatoryHeaders) => {
  let mandatoryHeaders = ["app_name"];
  let headersSchema = {
    app_name: { type: "string", enum: ["my-web"] },
  };

  if (customHeaders) {
    headersSchema = {
      ...headersSchema,
      ...customHeaders,
    };
  }

  if (customMandatoryHeaders) {
    mandatoryHeaders.push(...customMandatoryHeaders);
  }

  return {
    type: "object",
    required: mandatoryHeaders,
    properties: headersSchema,
  };
};

export const getBody = (bodySchema, mandatoryParams) => {
  let body = {
    type: "object",
    properties: bodySchema,
  };
  if (mandatoryParams) body = { ...body, required: mandatoryParams };
  return body;
};

export const getQueryParams = (querySchema, mandatoryParams) => {
  let params = {
    type: ["object", "null"],
    properties: querySchema,
  };
  if (mandatoryParams) params = { ...params, required: mandatoryParams };
  return params;
};
