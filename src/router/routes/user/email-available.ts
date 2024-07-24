"use strict";

import * as express from "express";
import { User } from "../../../defs/models/user.model";

import { has } from "lodash";
import { body } from "express-validator";
import { IResponseBody, responses } from "../../../defs/responses";
import { getConnectedClient, usersCollection } from "../../../db";
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
      const client = await getConnectedClient();
      const users = await usersCollection(client);
      const doc = await users.findOne({ emailNormalized: email });

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
      return res.json(responses.email_already_registered());
    } catch (error) {
      console.log("Error finding user by email. Error:", error);
      return res.status(500).json(responses.caught_error(error));
    }
  }
);

module.exports = router;
