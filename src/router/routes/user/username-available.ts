"use strict";

import * as express from "express";
import { User } from "../../../defs/models/user.model";

import { Types } from "mongoose";
import { body, validationResult } from "express-validator";
import { IResponseBody, responses } from "../../../defs/responses";
const router = express.Router();

router.post(
  "/",
  body("username").notEmpty().bail().isString().bail().escape(),
  async (
    req: express.Request<never, never, { username: string }>,
    res: express.Response<IResponseBody>
  ) => {
    try {
      const validatedErrors = validationResult(req).array();
      console.log("/user/usernameAvailable reached...");
      console.log(req.body.username);

      if (validatedErrors.length) {
        return res.status(422).json(responses.missing_body_fields);
      }

      const doc = await User.findOne({
        usernameNormalized: req.body.username.toLowerCase(),
      }).exec();
      console.log("User.find by username complete ... ");
      /*--------------------------------------------------
       * 'Username' is already registered to a user
       *------------------------------------------------*/
      if (!doc) {
        return res.json(responses.username_already_registered);
      }
      /*--------------------------------------------------
       * 'Username' is NOT registered to a user.
       *------------------------------------------------*/
      console.log("Username is already registered.");
      console.log("doc", doc);
      return res.json(responses.username_or_email_already_registered);
    } catch (error) {
      console.log("Error finding user by email", error);

      return res.status(500).json(responses.caught_error(error));
    }
  }
);

module.exports = router;
