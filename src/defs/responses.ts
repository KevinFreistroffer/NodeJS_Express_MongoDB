import { EMessageType } from "./enums";
import { ISanitizedUser } from "./interfaces";

export interface IResponseCode {
  description: string;
  code: number;
  user?: ISanitizedUser | ISanitizedUser[];
}

export interface IResponseBody {
  message: EMessageType;
  data: IResponseCode;
}

export interface IDataWithUser extends IResponseCode {
  user: ISanitizedUser;
}

export interface IDataWithUsers extends IResponseCode {
  users: ISanitizedUser[];
}

export interface IResponseBodies {
  user_not_found: (description?: string) => IResponseBody;
  users_not_found: (description?: string) => IResponseBody;
  invalid_usernameOrEmail_and_password: (description?: string) => IResponseBody;
  invalid_password: (description?: string) => IResponseBody;
  invalid_request: (description?: string) => IResponseBody; // TODO is this going to get used?
  missing_parameters: (description?: string) => IResponseBody;
  missing_body_fields: (description?: string) => IResponseBody;
  access_denied: (description?: string) => IResponseBody;
  route_not_found: (description?: string) => IResponseBody;
  username_or_email_already_registered: (description?: string) => IResponseBody;
  username_already_registered: (description?: string) => IResponseBody;
  email_already_registered: (description?: string) => IResponseBody;
  caught_error: (error: unknown) => IResponseBody;
  error_updating_user: (description?: string) => IResponseBody;
  success: (user?: ISanitizedUser | ISanitizedUser[]) => IResponseBody;
}

export const responses: IResponseBodies = {
  user_not_found: (description) => ({
    message: EMessageType.error,
    data: {
      description: description || "User not found.",
      code: 1000,
      user: undefined,
    },
  }),
  users_not_found: (description) => ({
    message: EMessageType.error,
    data: {
      description: description || "Users not found.",
      code: 1001,
      user: undefined,
    },
  }),
  invalid_usernameOrEmail_and_password: (description) => ({
    message: EMessageType.error,
    data: {
      description: description || "Invalid username or email and password.",
      code: 1002,
      user: undefined,
    },
  }),
  invalid_password: (description) => ({
    message: EMessageType.error,
    data: {
      description: description || "Invalid password.",
      code: 1003,
      user: undefined,
    },
  }),
  invalid_request: (description) => ({
    message: EMessageType.error,
    data: {
      description: description || "Invalid request.",
      code: 1004,
      user: undefined,
    },
  }),
  missing_parameters: (description) => ({
    message: EMessageType.error,
    data: {
      description: description || "Missing parameters.",
      code: 1005,
      user: undefined,
    },
  }),
  missing_body_fields: (description) => ({
    message: EMessageType.error,
    data: {
      description: description || "Missing body fields.",
      code: 1006,
      user: undefined,
    },
  }),
  access_denied: (description) => ({
    message: EMessageType.error,
    data: {
      description: description || "Access denied.",
      code: 1007,
      user: undefined,
    },
  }),
  route_not_found: (description) => ({
    message: EMessageType.error,
    data: {
      description: description || "Route not found.",
      code: 1008,
      user: undefined,
    },
  }),
  username_or_email_already_registered: (description) => ({
    message: EMessageType.error,
    data: {
      description: description || "Username or email already registered.",
      code: 1009,
      user: undefined,
    },
  }),
  username_already_registered: (description) => ({
    message: EMessageType.error,
    data: {
      description: description || "Username already registered.",
      code: 1010,
      user: undefined,
    },
  }),
  email_already_registered: (description) => ({
    message: EMessageType.error,
    data: {
      description: description || "Email already registered.",
      code: 1011,
      user: undefined,
    },
  }),

  caught_error: (error: any) => ({
    message: EMessageType.error,
    data: {
      description: `Caught error:" ${
        error instanceof Error ? error.message : error
      }`,
      code: 1012,
      user: undefined,
    },
  }),
  error_updating_user: (description) => ({
    message: EMessageType.error,
    data: {
      description: description || "Could not update the user. Try again.",
      code: 1013,
      user: undefined,
    },
  }),
  success: (
    user?: ISanitizedUser | ISanitizedUser[],
    description?: string
  ) => ({
    message: EMessageType.success,
    data: {
      description: description || "Success.",
      code: 2000,
      user,
    },
  }),
};
