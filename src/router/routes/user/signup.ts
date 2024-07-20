"use strict";

import { Connection, Types } from "mongoose";
import * as express from "express";
import * as bcrypt from "bcryptjs";
import { User } from "../../../defs/models/user.model";
import { body, validationResult } from "express-validator";
import { lucia } from "../../../config/db/lucia";
import { IResponseBody, responses } from "../../../defs/responses";

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
        return res.status(422).json(responses.missing_body_fields);
      }

      const { username, userId, email, password } = req.body;
      console.log("[SignUp] req.body", req.body);

      const doc = await User.findOne({
        $or: [{ username: req.body.username }, { email: req.body.email }],
      }).exec();
      console.log("[SignUp] foundUser doc", doc);

      /*--------------------------------------------------
       *  'Username' and/or 'Email' are already registered
       *------------------------------------------------*/
      if (doc !== null) {
        console.log("Username and/or email already taken.", doc);

        // Username already taken
        usernameAvailable = username === doc.username;
        emailAvailable = email === doc.email;

        return res.json(responses.username_or_email_already_registered);
      }

      /* ----------------------------------------------------------------
       *  SUCCESS
       *  No errors and the username and email aren't already registered.
       *  Create and Save this new user
       * --------------------------------------------------------------*/
      const saltRounds = 10;

      bcrypt.genSalt(saltRounds, (err, salt) => {
        bcrypt.hash(password, salt, async (err, hash) => {
          if (err) {
            throw new Error("Error hashing the password. Error: " + err);
          }

          // Create
          const newUser = new User({
            username,
            usernameNormalized: username.toLowerCase(),
            email,
            emailNormalized: email.toLowerCase(),
            password: hash,
            resetPasswordToken: "",
            resetPasswordExpires: "",
          });

          // Save
          const createdUser = await newUser.save();
          console.log("createdUser", createdUser);

          if (createdUser) {
            /* ----------------------------------
             *  SUCCESS
             *  Successfully saved this new user.
             * --------------------------------*/
            console.log("[SignUp] Success creating a new user.");

            const session = await lucia.createSession(
              createdUser._id.toString(),
              {}
            );

            console.log("session", session);

            const sessionCookie = lucia
              .createSessionCookie(session.id)
              .serialize();

            console.log(sessionCookie);

            return res
              .appendHeader("Set-Cookie", sessionCookie)
              .json(responses.success(createdUser));
          }
        });
      });
    } catch (error) {
      console.log("[SignUp] err.", error);

      return res.status(500).json(responses.caught_error(error));
    }
  }
);

module.exports = router;
