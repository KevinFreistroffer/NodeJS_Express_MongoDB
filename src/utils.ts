import { Document } from "mongoose";
import config from "./config";
import { Response } from "express";
import { responses } from "./defs/responses";
import { MongoClient, ServerApiVersion } from "mongodb";
import { JwtPayload, VerifyErrors, verify } from "jsonwebtoken";
import { usersCollection } from "./db";
import { UserProjection } from "./defs/models/user.model";
import * as bcrypt from "bcryptjs";

export const verifyJWT = async (token: string) => {
  if (!isJwtPayload(token)) {
    throw new Error(
      "Invalid JWT payload. The decoded value is not of type JwtPayload."
    );
  }

  const callback = async (
    error: VerifyErrors | null,
    decoded: string | JwtPayload | undefined
  ) => {
    // Error decoding the JWT token
    if (error) {
      throw error;
    }

    if (!isJwtPayload(decoded)) {
      throw new Error(
        "Invalid JWT payload. The decoded value is not of type JwtPayload."
      );
    } else {
      const users = await usersCollection();
      // Find user by username or email
      const doc = await users.findOne(
        { _id: decoded.data },
        { projection: UserProjection }
      );

      console.log("[Authenticate] found user by username or email: ", doc);
      /*--------------------------------------------------
       * User NOT found
       *------------------------------------------------*/
      if (!doc) {
        throw new Error("User not found.");
      }

      /*--------------------------------------------------
       * User found
       *------------------------------------------------*/
      console.log("Found a user by username/email.");
      bcrypt.compare(
        decoded.data.password,
        doc.password,
        (compareError, validPassword) => {
          /*--------------------------------------------------
           * Error comparing passwords
           *------------------------------------------------*/
          if (compareError) {
            console.log(
              "[Login] Error BCrypt comparing passwords: ",
              compareError
            );
            throw new Error("Error BCrypt comparing passwords " + compareError);
          }

          /*--------------------------------------------------
           * Invalid password
           *------------------------------------------------*/
          if (!validPassword) {
            throw new Error("Invalid password.");
          }

          /*--------------------------------------------------
           * Valid password
           *------------------------------------------------*/
          console.log("SUCCESSFULL login");
          return true;
        }
      );
    }
  };

  const bird = verify(token, config.jwtSecret, callback);
  console.log(bird);

  function* generator(i: any) {
    yield bird;
    yield i + 10;
  }

  const gen = generator(10);
  console.log(gen.next().value);
  // Expected output: 10

  console.log(gen.next().value);
};

export const isJwtPayload = (arg: any): arg is JwtPayload => {
  return arg && arg.data;
};
