/**
 * Utility for error messages and status
 */
module.exports = {
    status: {
      Created: 201,
      NoContent: 204,
      BadRequest: 400,
      Unauthorized: 401,
      Forbidden: 403,
      NotFound: 404,
      RequestTimeout: 408,
      AuthenticationTimeout: 419,
      UnprocessableEntity: 422,
      InternalServerError: 500,
      NotImplemented: 501,
      ServiceUnavailable: 503,
      GatewayTimeout: 504,
      SessionTimeout: 599
    },
    message: {
      OK: 'The request is successful, and results may be obtained in the response body',
      Created: 'The POST request was successful, and results may be obtained in the response body.',
      NoContent: 'The request was successful, but the response body is empty as nothing deemed important was returned.',
      BadRequest: 'The server was not able to understand the request. It is possibly missing required parameters or has parameters with values of an invalid type. The response should include an error object with more information.',
      Unauthorized: 'The authentication has failed for the user.',
      Forbidden: 'You do not have access to this page. In order to request access, please contact your Question Qraft Administrator.',
      UnkonwOrigin: 'We are not able to identify origin of the request.',
      NoProvider: 'No provider specified.',
      NoService: 'No service specified.',
      SSOFetchError: 'Unable to fetch Single Sign On details. Please check your network connection and try again, or contact your system administrator for assistance.',
      insufficientData: 'Data not provided or provided data is insufficient.',
      NotFound: 'The endpoint is not valid, or a resource represented by the request does not exist.',
      RequestTimeout: 'The server was not able to complete your request in the time allotted. This could be due to server load, and may be retried in the future.',
      AuthenticationTimeout: 'The access token being used has expired.',
      UnprocessableEntity: 'The request was understood, but has failed some business-level validation. Inspect the error object for more information.',
      InternalServerError: 'Some unhandled server error has occurred',
      NotImplemented: 'This API endpoint is not yet implemented; please contact service developers for more information.',
      ServiceUnavailable: 'The service is temporarily unavailable. Please try again later.',
      GatewayTimeout: 'The request was unable to be processed in time. This may be due to server load. Please try again later.',
      SessionTimeout: 'Session has expired.',
      emailNotFound: "Please check your email.",
      wrongCredentials: "You have entered invalid email address and/or password.",
      roleNotFound: "Unable to find your role.",
      noAccessRight: "You do not have access right.",
      invalidPassword: "Password is invalid",
      invalidToken: "Check your token details. Not matched with any user.",
      grantTypeNotFound: 'Not found valid grantType.',
      authorizationNotFound: 'No Authorization header is provided',
      userExist: "Usename already exist.",
      wrongOldPassword: "Check you old password.",
      noNewPassword: 'Provide new password to change old password',
      NoHeaderFound: 'No header is provided',
      noRoleFound: 'Role is not found',
      passwordChangeRequired: 'Your password has expired. Please change it.',
      maxFailLoginAttemptWitMail: 'If the email address entered is valid, new password will be sent to it.',
      passwordRequiredPatternFailed: 'Password must have at least: 8 characters, 1 uppercase letter, 1 lowercase letter, 1 number and 1 special character',
    },
    formatErrors: function (errorsIn) {
      let errors = {};
      let a, e;
  
      for (a = 0; a < errorsIn.length; a++) {
        e = errorsIn[a];
  
        errors[e.property] = errors[e.property] || [];
        errors[e.property].push(e.msg);
      }
      return errors;
    }
  };
  