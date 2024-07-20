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

export interface IResponseBodies {
  user_not_found: () => IResponseBody;
  users_not_found: () => IResponseBody;
  invalid_usernameOrEmail_and_password: () => IResponseBody;
  invalid_password: () => IResponseBody;
  invalid_request: () => IResponseBody; // TODO is this going to get used?
  missing_parameters: () => IResponseBody;
  missing_body_fields: () => IResponseBody;
  access_denied: () => IResponseBody;
  route_not_found: () => IResponseBody;
  username_or_email_already_registered: () => IResponseBody;
  username_already_registered: () => IResponseBody;
  email_already_registered: () => IResponseBody;
  caught_error: (error: unknown) => IResponseBody;
  success: (user?: ISanitizedUser | ISanitizedUser[]) => IResponseBody;
}

export const responses: IResponseBodies = {
  user_not_found: () => ({
    message: EMessageType.error,
    data: {
      description: "User not found.",
      code: 1000,
      user: undefined,
    },
  }),
  users_not_found: () => ({
    message: EMessageType.error,
    data: {
      description: "Users not found.",
      code: 1001,
      user: undefined,
    },
  }),
  invalid_usernameOrEmail_and_password: () => ({
    message: EMessageType.error,
    data: {
      description: "Invalid username or email and password.",
      code: 1002,
      user: undefined,
    },
  }),
  invalid_password: () => ({
    message: EMessageType.error,
    data: {
      description: "Invalid password.",
      code: 1003,
      user: undefined,
    },
  }),
  invalid_request: () => ({
    message: EMessageType.error,
    data: {
      description: "Invalid request.",
      code: 1004,
      user: undefined,
    },
  }),
  missing_parameters: () => ({
    message: EMessageType.error,
    data: {
      description: "Missing parameters.",
      code: 1005,
      user: undefined,
    },
  }),
  missing_body_fields: () => ({
    message: EMessageType.error,
    data: {
      description: "Missing body fields.",
      code: 1006,
      user: undefined,
    },
  }),
  access_denied: () => ({
    message: EMessageType.error,
    data: {
      description: "Access denied.",
      code: 1007,
      user: undefined,
    },
  }),
  route_not_found: () => ({
    message: EMessageType.error,
    data: {
      description: "Route not found.",
      code: 1008,
      user: undefined,
    },
  }),
  username_or_email_already_registered: () => ({
    message: EMessageType.error,
    data: {
      description: "Username or email already registered.",
      code: 1009,
      user: undefined,
    },
  }),
  username_already_registered: () => ({
    message: EMessageType.error,
    data: {
      description: "Username already registered.",
      code: 1010,
      user: undefined,
    },
  }),
  email_already_registered: () => ({
    message: EMessageType.error,
    data: {
      description: "Email already registered.",
      code: 1011,
      user: undefined,
    },
  }),
  caught_error: (error: any) => ({
    message: EMessageType.error,
    data: {
      description: `Caught error: " ${
        error instanceof Error ? error.message : error
      }`,
      code: 1012,
      user: undefined,
    },
  }),
  success: (user?: ISanitizedUser | ISanitizedUser[]) => ({
    message: EMessageType.success,
    data: {
      description: "Success.",
      code: 2000,
      user,
    },
  }),
};
