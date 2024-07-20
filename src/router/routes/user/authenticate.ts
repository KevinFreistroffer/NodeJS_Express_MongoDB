"use strict";

import { users as mockUsers } from "../../../data/mock_users";
import config from "../../../../src/config";
import * as express from "express";
import { verify, JwtPayload } from "jsonwebtoken";

import * as bcrypt from "bcryptjs";
import { User } from "../../../defs/models/user.model";
import { Types } from "mongoose";
import { body, validationResult } from "express-validator";
import { has } from "lodash";
import { IResponseBody, responses } from "../../../defs/responses";
const router = express.Router();

function isJwtPayload(arg: any): arg is JwtPayload {
  return arg && arg.data;
}

router.post(
  "/",
  body("token").notEmpty().bail().isString().bail().escape(),
  async (
    req: express.Request<never, never, { token: string }>,
    res: express.Response<IResponseBody>
  ) => {
    try {
      const validatedErrors = validationResult(req).array();
      if (validatedErrors.length) {
        res.status(422).json(responses.missing_body_fields());

        return;
      }
      let token = req.body.token;

      console.log("/authenticate reached...");
      console.log("request body data: ", req.body);

      if (config.online) {
        verify(token, config.jwtSecret, async (decodeError, decoded) => {
          // Error decoding the JWT token
          if (decodeError) {
            throw decodeError;
          }

          if (!isJwtPayload(decoded)) {
            throw new Error(
              "Invalid JWT payload. The decoded value is not of type JwtPayload."
            );
          } else {
            const doc = await User.findById(decoded.data).exec();
            console.log(
              "[Authenticate] found user by username or email: ",
              doc
            );
            /*--------------------------------------------------
             * User NOT found
             *------------------------------------------------*/
            if (!doc) {
              return res.status(200).json(responses.user_not_found());
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
                  throw new Error(
                    "Error BCrypt comparing passwords " + compareError
                  );
                }

                /*--------------------------------------------------
                 * Invalid password
                 *------------------------------------------------*/
                if (!validPassword) {
                  return res.status(200).json(responses.invalid_password());
                }

                /*--------------------------------------------------
                 * Valid password
                 *------------------------------------------------*/
                console.log("SUCCESSFULL login");
                return res.json(responses.success(doc));
              }
            );
          }
        });
      } else {
        console.log("Offline login handler.");
        res.json(responses.success());

        return;
      }
    } catch (error) {
      console.log("[/authenticate] Caught error. Error: ", error);
      return res.status(500).json(responses.caught_error(error));
    }
  }
);

module.exports = router;
