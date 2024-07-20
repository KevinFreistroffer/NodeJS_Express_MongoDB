import { Document, Types } from "mongoose";

export interface IResponse {
  success: boolean;
  message: string;
  data: ISanitizedUser | undefined;
}

export interface IJournal {
  title: string;
  entry: string;
  category: string;
  date: string;
  selected: boolean;
}

export interface IJournalDoc extends IJournal, Document {}

export interface ICategory {
  category: string;
  selected: boolean;
}

export interface ICategoryDoc extends ICategory, Document {}

export interface IUser {
  username: string;
  usernameNormalized: string;
  email: string;
  emailNormalized: string;
  password: string;
  resetPasswordToken: string;
  resetPasswordExpires: Date;
  verified?: boolean; // Todo should make this required and setup the email verification
  jwtToken: string;
  journals: IJournal[];
  journalCategories: ICategory[];
}

export interface ISanitizedUser
  extends Omit<
    IUser,
    "password" | "usernameNormalized" | "emailNormalized"
    // | "resetPasswordToken"
    // | "resetPasswordExpires"
    // | "jwtToken"
  > {}

export interface ISession {
  _id: string;
  expires_at: Date;
  user_id: string;
}

export interface IUserDoc extends IUser, Document {
  journals: IJournalDoc[];
  journalCategories: ICategoryDoc[];
}

export interface ISessionDoc {
  _id: string;
  expires_at: Date;
  user_id: string;
}
