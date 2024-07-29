"use strict";

import * as express from "express";
import * as bcrypt from "bcryptjs";
import { InsertOneResult } from "mongodb";
import { UserProjection } from "../../../defs/models/user.model";
import { body, validationResult } from "express-validator";
import { IResponseBody, responses } from "../../../defs/responses";
import { getConnectedClient, usersCollection } from "../../../db";
import { ISanitizedUser, IUser } from "../../../defs/interfaces";

const router = express.Router();

interface IRequestBody {
  username: string;
  // userId: string;
  email: string;
  password: string;
}

// interface IResponseBody {
//   success: boolean;
//   message: string;
//   usernameAvailable: boolean;
//   emailAvailable: boolean;
//   data: string | undefined;
// }

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
    let usernameAvailable = false;
    let emailAvailable = false;
    try {
      const validatedFields = validationResult(req);

      if (!validatedFields.isEmpty()) {
        return res.status(422).json(responses.missing_body_fields());
      }

      const { username, userId, email, password } = req.body;
      console.log("[SignUp] req.body", req.body);

      const client = await getConnectedClient();
      const users = await usersCollection(client);
      const doc = await users.findOne<IUser>({
        $or: [{ username }, { email }],
      });

      /*--------------------------------------------------
       *  'Username' and/or 'Email' are already registered
       *------------------------------------------------*/
      if (doc) {
        return res.json(responses.username_or_email_already_registered());
      }

      const saltRounds = 10;

      // const salt = (saltError: Error | null, salt: string) => {};

      const salt = await bcrypt.genSalt(saltRounds);

      if (!salt) {
        throw new Error("Error generating salt.");
      }

      if (salt) {
        console.log("SALT", salt);

        const hashedPassword = await bcrypt.hash(password, salt);

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

        console.log("insertDoc", insertDoc, Object.keys(insertDoc));

        if (!insertDoc.acknowledged) {
          console.log("Could not insert document.", insertDoc);
          throw new Error("Could not insert document. Try again.");
        }

        const newUserDoc = (await users.findOne(
          { _id: insertDoc.insertedId },
          { projection: UserProjection }
        )) as ISanitizedUser;

        if (!newUserDoc) {
          throw new Error("Error finding the newly created user's ObjectId.");
        }

        console.log("[SignUp] Success creating a new user.", newUserDoc);

        return res.json(responses.success(newUserDoc));
      }
    } catch (error) {
      console.log("[SignUp] err.", error);

      return res.status(500).json(responses.caught_error(error));
    }
  }
);

module.exports = router;
