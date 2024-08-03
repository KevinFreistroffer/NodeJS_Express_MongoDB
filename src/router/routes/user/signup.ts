"use strict";

import * as express from "express";
import * as bcrypt from "bcryptjs";
import { InsertOneResult, WriteError } from "mongodb";
import { UserProjection } from "../../../defs/models/user.model";
import { body, validationResult } from "express-validator";
import { IResponseBody, responses } from "../../../defs/responses";
import { getConnectedClient, usersCollection } from "../../../db";
import { ISanitizedUser, IUser } from "../../../defs/interfaces";
import { convertDocToSafeUser, hashPassword } from "../../../utils";
import { findByUsernameOrEmail } from "../../../operations/user";

const router = express.Router();

interface IRequestBody {
  username: string;
  email: string;
  password: string;
}

router.post(
  "/",
  // Consider using express-validator to validate the request body
  // doing a user.findOne email or username. if found then throw new error
  body([
    "username",
    // "userId",
    "password",
  ])
    .notEmpty()
    .bail()
    .isString()
    .bail()
    .escape(),
  body("email").notEmpty().bail().isEmail().bail().escape(),
  async (
    req: express.Request<IRequestBody>,
    res: express.Response<IResponseBody>
  ) => {
    console.log("/user/signup reached...");
    try {
      /*--------------------------------------------------
       *  Validate request body.
       *------------------------------------------------*/
      const validatedFields = validationResult(req);
      if (!validatedFields.isEmpty()) {
        return res.status(422).json(responses.missing_body_fields());
      }

      /*--------------------------------------------------
       *  Valid request body.
       *------------------------------------------------*/
      const { username, userId, email, password } = req.body;

      /*--------------------------------------------------
       *  MongoDB User collection
       *------------------------------------------------*/
      const client = await getConnectedClient();
      const users = await usersCollection(client);

      /*--------------------------------------------------
       *  Find user by username or email.
       *------------------------------------------------*/
      const doc = await findByUsernameOrEmail(username, email);

      /*--------------------------------------------------
       *  Username and/or Email are already registered.
       *------------------------------------------------*/
      if (doc) {
        return res.json(responses.username_or_email_already_registered());
      }

      /*--------------------------------------------------
       *  Save the user
       *------------------------------------------------*/
      const insertDoc = await users.insertOne({
        username,
        usernameNormalized: username.toLowerCase(),
        email,
        emailNormalized: email.toLowerCase(),
        password: await hashPassword(password),
        resetPasswordToken: "",
        // jwtToken: "",
        journals: [],
        journalCategories: [],
      });

      if (!insertDoc.acknowledged) {
        throw new Error("Could not insert document. Try again.");
      }

      /*--------------------------------------------------
       *  Find the newly created user doc
       *------------------------------------------------*/
      const newUserDoc = await users.findOne(
        { _id: insertDoc.insertedId },
        { projection: UserProjection }
      );

      if (!newUserDoc) {
        throw new Error("Error finding the newly created user's ObjectId.");
      }

      return res.json(responses.success(convertDocToSafeUser(newUserDoc)));
    } catch (error) {
      console.log("[/user/signup] caught error.", error);

      // MongoDB error types
      // WriteError = DuplicateKey
      // WriteConcernError = 
      if (error instanceof WriteError) {
        return res.json(responses.username_or_email_already_registered());
      }

      return res.status(500).json(responses.caught_error(error));
    }
  }
);

module.exports = router;
