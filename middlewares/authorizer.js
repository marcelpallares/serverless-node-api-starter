const { pick } = require("lodash");
const {
  getToken,
  getRefreshToken,
  decodeToken,
  isTokenExpired,
  newAccessToken,
  newRefreshToken,
} = require("../lib/jwt");
const {
  findUser,
  getUserById,
  getMyUserResponseFields,
  addRefreshToken,
  removeRefreshToken,
} = require("../models/userModel");
const { getTermsResponseFields } = require("../models/termsModel");
const {
  hasLoggedInCookie,
  hasAnonymousCookie,
  getAccessTokenCookieObj,
  getRefreshTokenCookieObj,
  getLoggedInCookieObj,
} = require("../utils/cookiesUtils");
const throwError = require("../utils/httpErrors");

export const authorizer = (config) => {
  if (config === undefined) {
    config = {
      isAnonymousAllowed: false,
    };
  }
  const isAnonymousAllowed = config.isAnonymousAllowed;

  return {
    before: async (handler, next) => {
      console.info("=> Starting authorizer middleware");
      console.info(
        isAnonymousAllowed
          ? "=> Anonymous users allowed"
          : "=> Only logged in users allowed"
      );
      const anonymous = hasAnonymousCookie(handler.event.headers);
      const loggedIn = hasLoggedInCookie(handler.event.headers);
      let accessToken = getToken(handler.event.headers);
      let refreshToken = getRefreshToken(handler.event.headers);
      let newTokensCreated = false;
      let user;

      let userLoggedIn =
        loggedIn &&
        !anonymous &&
        accessToken &&
        accessToken !== "invalidToken" &&
        !isTokenExpired(accessToken);
      let userAnonymous =
        isAnonymousAllowed &&
        anonymous &&
        !loggedIn &&
        accessToken &&
        accessToken !== "invalidToken" &&
        !isTokenExpired(accessToken);
      let userRefreshNeeded =
        loggedIn &&
        refreshToken &&
        refreshToken !== "invalidToken" &&
        !isTokenExpired(refreshToken);

      if (userLoggedIn) {
        console.info(
          "Logged in user is authorized, access token is still valid."
        );
      } else if (userAnonymous) {
        console.info(
          "Anonymous user is authorized, access token is still valid."
        );
      } else if (userRefreshNeeded) {
        console.info("Logged in  user needs to refresh tokens. Refresh valid.");
        console.log("Old refresh token: ", refreshToken);

        // Check if the token exists in any user
        user = await findUser({ "tokens.refresh": refreshToken });
        if (!user) {
          console.info("Cannot find user refresh token");
          throwError.authTokenNotValid();
        }
        // Removes the old refresh token from the user db
        await removeRefreshToken(user, refreshToken);

        // Create a new refresh token and save it to the user object
        refreshToken = newRefreshToken();
        console.log("New refresh token: ", refreshToken);
        await addRefreshToken(user, refreshToken);

        //Create a new access token
        accessToken = newAccessToken(user.id);

        newTokensCreated = true;
        console.info("New user tokens created");
      } else if (anonymous && !isAnonymousAllowed) {
        console.info("Trying to access protected resource with anonymous user");
        throwError.anonymousNotAllowed();
      } else {
        console.info("User unauthorized");
        throwError.unauthorized();
      }

      // Decode received token
      const { any, usr } = decodeToken(accessToken);

      // Check if user exists
      user = await getUserById(usr);

      // Deny access if user nor anonymous user is found
      if (!user && userAnonymous && (!any || !anonymous)) {
        console.info("User unauthorized, no user found on token");
        throwError.unauthorized();
      } else if (user) {
        console.info(`Logged in user is authorized: ${user.email}`);
      } else if (userAnonymous && any) {
        console.info(`Anonymous user is authorized: ${any}`);
      }

      const extraData = {
        anonymous: any && userAnonymous ? true : false,
      };

      // Adding user to extraData
      if (user) {
        extraData.principalId = user.id;
        extraData.user = {
          ...pick(user, ["_id", ...getMyUserResponseFields()]),
          acceptedTerms: pick(user.terms[0], getTermsResponseFields()),
        };
      }

      // Adding newTokens to extraData
      if (newTokensCreated) {
        extraData.setCookies = [
          getAccessTokenCookieObj(accessToken),
          getRefreshTokenCookieObj(refreshToken),
          getLoggedInCookieObj(),
        ];
      }

      // Adding extra data to handler.event object
      handler.event.extraData = extraData;

      console.info("=> Ending authorizer middleware");
      return;
    },
  };
};
