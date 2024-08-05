"use strict";

import * as express from "express";
import * as bcrypt from "bcryptjs";
import { InsertOneResult, WriteError } from "mongodb";
import { UserProjection } from "../../../defs/models/user.model";
import { body, validationResult } from "express-validator";
import { IResponseBody, responses } from "../../../defs/responses";
import { usersCollection } from "../../../db";
import { ISanitizedUser, IUser } from "../../../defs/interfaces";
import { convertDocToSafeUser, hashPassword } from "../../../utils";
import {
  findOneByUsernameOrEmail,
  findOneById,
  insertOne,
} from "../../../operations/user_operations";

const router = express.Router();

interface IRequestBody {
  username: string;
  email: string;
  password: string;
}

router.post(
  "/",
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
    req: express.Request<any, any, IRequestBody>,
    res: express.Response<IResponseBody>
  ) => {
    console.log("/user/signup reached...");

    try {
      const validatedFields = validationResult(req);
      if (!validatedFields.isEmpty()) {
        return res.status(422).json(responses.missing_body_fields());
      }

      const { username, email, password } = req.body;
      const doc = await findOneByUsernameOrEmail(username, email);

      if (doc) {
        return res.json(responses.username_or_email_already_registered());
      }

      const insertDoc = await insertOne({
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

      if (!insertDoc.insertedId) {
        return res.json(responses.error_inserting_user());
      }

      const userDoc = await findOneById(insertDoc.insertedId);

      if (!userDoc) {
        return res.json(responses.user_not_found());
      }

      return res.json(responses.success(convertDocToSafeUser(userDoc)));
    } catch (error) {
      console.log("[/user/signup] caught error.", error);

      // MongoDB error types
      // WriteError = DuplicateKey
      // WriteConcernError =
      // if (error instanceof WriteError) {
      //   return res.json(responses.username_or_email_already_registered());
      // }

      return res.status(500).json(responses.caught_error(error));
    }
  }
);

module.exports = router;
