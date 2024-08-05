"use strict";

import { users as mockUsers } from "../../../data/mock_users";
import config from "../../../../src/config";
import * as express from "express";
import * as bcrypt from "bcryptjs";
import moment from "moment";
import { sign } from "jsonwebtoken";
import { UserProjection } from "../../../defs/models/user.model";
import { body, validationResult } from "express-validator";
import { has } from "lodash";
import {
  IResponseBody as _IResponseBody,
  IResponseBodyData,
  responses,
} from "../../../../src/defs/responses";
import { EMessageType } from "../../../defs/enums";
import { ISanitizedUser, IUser } from "../../../defs/interfaces";
import { usersCollection } from "../../../db";
import { convertDocToSafeUser } from "../../../utils";
import { findOne } from "../../../operations/user_operations";

const router = express.Router();

interface IRequestBody {
  usernameOrEmail: string;
  password: string;
  staySignedIn?: boolean;
}

interface IData extends IResponseBodyData {
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
    req: express.Request<any, any, IRequestBody>,
    res: express.Response<IResponseBody>
  ) => {
    try {
      const validStaySignedIn = has(req.body, "staySignedIn")
        ? typeof req.body.staySignedIn === "boolean"
          ? true
          : false
        : true;

      const validatedResults = validationResult(req);

      if (validatedResults.array().length || !validStaySignedIn) {
        return res.status(422).json(responses.missing_body_fields());
      }

      const { usernameOrEmail, password, staySignedIn } = req.body;
      console.log("/login reached");
      console.log("request body: ", req.body, staySignedIn);

      const UNSAFE_DOC = await findOne({
        query: {
          $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
        },
        sanitize: false,
      });

      if (!UNSAFE_DOC) {
        console.log("User doesn't exist.");

        return res.status(200).json(responses.user_not_found());
      }

      /*--------------------------------------------------
       * Compare passwords.
       *------------------------------------------------*/
      const passwordsMatch = await bcrypt.compare(
        password,
        UNSAFE_DOC.password
      );
      console.log(passwordsMatch);

      if (!passwordsMatch) {
        return res.status(401).json(responses.invalid_password());
      }

      /*-----------------------------------------------------
       * Generate a JWT
       *---------------------------------------------------*/
      let jwtToken;
      if (staySignedIn) {
        console.log("User chose to stay logged in. Generating a JWT");

        // const timeStamp = moment().add(14, "days");
        jwtToken = sign({ data: UNSAFE_DOC._id.toString() }, config.jwtSecret, {
          expiresIn: config.jwtTokenExpiresIn,
        });

        if (!jwtToken) {
          throw new Error("Error generating JWT token.");
        }
      }

      // TODO: make a single function that handles returning responses, and uses the convertDocToSafeUser
      return res.json({
        ...responses.success(),
        data: {
          ...responses.success().data,
          user: undefined,
          jwtToken,
        },
      });
    } catch (error) {
      return res.status(500).json(responses.caught_error(error));
    }
  }
);

module.exports = router;
