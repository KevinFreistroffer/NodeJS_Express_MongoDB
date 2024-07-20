export interface IResponse {
  success: boolean;
  userExists: boolean;
  loggedIn: boolean;
  message: string;
  data: string;
}

export interface ISuccessResponse extends IResponse {
  success: boolean;
  userExists: boolean;
  loggedIn: boolean;
  message: string;
  data: string;
}

let successResponse: {
  success: boolean;
  userExists: boolean;
  loggedIn: boolean;
  message: string;
  data: string;
  jwtToken?: string;
  hashedUser?: string;
} = {
  success: false,
  userExists: false,
  loggedIn: false,
  message: " ",
  data: "",
};

let responseBody: {
  success: boolean;
  userExists: boolean;
  loggedIn: boolean;
  message: string;
  data: any;
  jwtToken?: string;
  hashedUser?: string;
} = {
  success: false,
  userExists: false,
  loggedIn: false,
  message: " ",
  data: {},
};
