"use strict";

import * as express from "express";
import { User } from "../../../defs/models/user.model";
import { Types } from "mongoose";
import { has } from "lodash";
import { body } from "express-validator";
import { IResponseBody, responses } from "../../../defs/responses";
const { query, validationResult } = require("express-validator");
const router = express.Router();

router.post(
  "/",
  body("email").isEmail().bail().escape(),
  async (
    req: express.Request<never, never, { email: string }>,
    res: express.Response<IResponseBody>
  ) => {
    const validatedErrors = validationResult(req).array();
    console.log("[/user/email-available] reached...");
    console.log(req.body);

    try {
      if (validatedErrors.length) {
        return res.status(422).json();
      }

      const email = req.body.email;
      const doc = await User.findOne({ emailNormalized: email }).exec();

      /*--------------------------------------------------
       * User NOT found.
       * Email IS available.
       *------------------------------------------------*/
      if (!doc) {
        return res.json(responses.user_not_found());
      }

      /*--------------------------------------------------
       * User found.
       * Email is NOT available.
       *------------------------------------------------*/
      console.log("Email is registered.");
      console.log("Found doc id", doc._id);
      return res.json(responses.email_already_registered);
    } catch (error) {
      console.log("Error finding user by email. Error:", error);
      return res.status(500).json(responses.caught_error);
    }
  }
);

module.exports = router;
