"use strict";

import * as express from "express";
import * as bcrypt from "bcryptjs";
import { InsertOneResult } from "mongodb";
import { UserProjection } from "../../../defs/models/user.model";
import { body, validationResult } from "express-validator";
import { IResponseBody, responses } from "../../../defs/responses";
import { getConnectedClient, usersCollection } from "../../../db";
import { ISanitizedUser, IUser } from "../../../defs/interfaces";
import { convertDocToSafeUser } from "../../../utils";

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
      console.log("[SignUp] req.body", req.body);

      /*--------------------------------------------------
       *  MongoDB User collection
       *------------------------------------------------*/
      const client = await getConnectedClient();
      const users = await usersCollection(client);

      /*--------------------------------------------------
       *  Find user by username or email.
       *------------------------------------------------*/
      const doc = await users.findOne<ISanitizedUser>(
        {
          $or: [{ username }, { email }],
        },
        { projection: UserProjection }
      );

      /*--------------------------------------------------
       *  Username and/or Email are already registered.
       *------------------------------------------------*/
      if (doc) {
        return res.json(responses.username_or_email_already_registered());
      }

      /*--------------------------------------------------
       *  Hash the password
       *------------------------------------------------*/
      const saltRounds = 10;
      const salt = await bcrypt.genSalt(saltRounds);

      if (!salt) {
        throw new Error("Error generating salt.");
      }

      const hashedPassword = await bcrypt.hash(password, salt);
      /*--------------------------------------------------
       *  Save the user
       *------------------------------------------------*/
      const insertDoc = await users.insertOne({
        username,
        usernameNormalized: username.toLowerCase(),
        email,
        emailNormalized: email.toLowerCase(),
        password: hashedPassword,
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
      const newUserDoc = (await users.findOne(
        { _id: insertDoc.insertedId },
        { projection: UserProjection }
      )) as ISanitizedUser;

      if (!newUserDoc) {
        throw new Error("Error finding the newly created user's ObjectId.");
      }

      return res.json(responses.success(convertDocToSafeUser(newUserDoc)));
    } catch (error) {
      console.log("[SignUp] err.", error);

      return res.status(500).json(responses.caught_error(error));
    }
  }
);

module.exports = router;
