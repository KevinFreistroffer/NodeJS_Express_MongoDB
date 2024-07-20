"use strict";

import { users as mockUsers } from "../../../data/mock_users";
import config from "../../../../src/config";
import * as express from "express";
import * as bcrypt from "bcryptjs";
import moment from "moment";
import { sign } from "jsonwebtoken";
import { User } from "../../../defs/models/user.model";

import { Document, Query, Types } from "mongoose";
import { body, checkExact, validationResult } from "express-validator";
import { has } from "lodash";
import {
  IResponseBody as _IResponseBody,
  IResponseCode,
  responses,
} from "../../../../src/defs/responses";
import { EMessageType } from "../../../defs/enums";
import { ISanitizedUser, IUser, IUserDoc } from "../../../defs/interfaces";
import { createCaughtErrorResponse } from "../../../utils";

const router = express.Router();

interface IRequestBody {
  usernameOrEmail: string;
  password: string;
  staySignedIn?: boolean;
}

interface IData extends IResponseCode {
  jwtToken?: string;
}
interface IResponseBody extends _IResponseBody {
  data: IData;
}

const validatedFields = body(["usernameOrEmail", "password"])
  .notEmpty()
  .bail()
  .isString()
  .bail()
  .escape();

router.post(
  "/",
  validatedFields,
  async (
    req: express.Request<IRequestBody>,
    res: express.Response<IResponseBody>
  ) => {
    try {
      const validStaySignedIn = has(req.body, "staySignedIn")
        ? typeof req.body.staySignedIn === "boolean"
          ? true
          : false
        : true;

      if (validationResult(req).array().length || !validStaySignedIn) {
        return res.status(422).json(responses.missing_body_fields);
      }

      const { usernameOrEmail, password, staySignedIn } = req.body;

      console.log("/login reached...");
      console.log("request body data: ", req.body, staySignedIn);

      if (config.online) {
        const doc = await User.findOne({
          $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
        })
          .select("password")
          .exec();

        console.log("[Login] found user by username or email: ", doc);

        /*--------------------------------------------------
         * User NOT found
         *------------------------------------------------*/
        if (!doc) {
          console.log("User doesn't exist.");

          return res.status(200).json(responses.user_not_found());
        }

        /*--------------------------------------------------
         * User NOT found
         * Compare the passwords
         *------------------------------------------------*/
        bcrypt.compare(
          password,
          doc.password,
          (compareError, validPassword) => {
            if (compareError) {
              throw new Error(compareError.message);
            }

            /*--------------------------------------------------
             *  Invalid password
             *------------------------------------------------*/
            if (!validPassword) {
              return res.status(200).json(responses.user_not_found());
            }

            /*--------------------------------------------------
             *  Valid password
             *------------------------------------------------*/
            let jwtToken;
            if (staySignedIn) {
              console.log("User chose to stay logged in. Generating hash ...");

              // const timeStamp = moment().add(14, "days");
              jwtToken = sign({ data: doc._id.toString() }, config.jwtSecret, {
                expiresIn: config.jwtTokenExpiresIn,
              });
            }

            return res.json({
              ...responses.success(),
              data: {
                ...responses.success().data,
                jwtToken,
              },
            });
          }
        );
      } else {
        // Offline login handler
        console.log("Offline login handler.");

        for (let i = 0; i < mockUsers.length; i++) {
          const user = mockUsers[i];
          console.log(mockUsers[i]);

          if (
            usernameOrEmail !== mockUsers[i].username ||
            password !== mockUsers[i].password
          ) {
            return res
              .status(200)
              .json(responses.invalid_usernameOrEmail_and_password);
          }

          console.log("[Offline] Successful login");
          return res.json(responses.success());
        }

        return res.json(responses.user_not_found());
      }
    } catch (error) {
      return res.status(500).json(responses.caught_error(error));
    }
  }
);

module.exports = router;
