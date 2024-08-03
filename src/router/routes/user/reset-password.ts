"use strict";

import * as express from "express";
import * as nodemailer from "nodemailer";
import config from "../../../../src/config";
import { body, validationResult } from "express-validator";

import { IResponseBody, responses } from "../../../defs/responses";
import { getConnectedClient, usersCollection } from "../../../db";
import { findOneById, updateOne } from "../../../operations/user_operations";
const router = express.Router();
const passwordHash = require("password-hash");
const validatedToken = body("token")
  .notEmpty()
  .bail()
  .isString()
  .bail()
  .escape();
const validatedPassword = body("password")
  .notEmpty()
  .bail()
  .isString()
  .bail()
  .escape();

router.post(
  "/",
  validatedToken,
  validatedPassword,
  async (
    req: express.Request<any, any, { token: string; password: string }>,
    res: express.Response<IResponseBody>
  ) => {
    try {
      const validatedErrors = validationResult(req).array();

      if (validatedErrors.length) {
        return res.status(422).json(responses.missing_body_fields());
      }

      // TODO: validate the JWT token. There needs to be an authentication step here prior to editing the password.

      const hashedPassword = passwordHash.generate(req.body.password);
      const doc = await updateOne(
        {
          resetPasswordToken: req.body.token,
          resetPasswordExpires: { $gt: new Date(Date.now()) },
        },
        { password: hashedPassword }
      );

      if (!doc.matchedCount) {
        return res.status(200).json(responses.user_not_found());
      }

      if (!doc.modifiedCount) {
        return res.status(200).json(responses.error_updating_user());
      }

      // Updating user object
      // TODO: sanitize the password?
      // const hashedPassword = passwordHash.generate(req.body.password);
      // foundUser.password = hashedPassword;
      // foundUser.resetPasswordToken = undefined;
      // foundUser.resetPasswordExpires = undefined;

      // Send Confirmation Email
      const transporter = nodemailer.createTransport(
        `smtps://${encodeURIComponent(
          config.email.fromEmail
        )}:${encodeURIComponent(config.email.password)}@smtp.gmail.com`
      );

      // setup e-mail data with unicode symbols
      const mailOptions = {
        from: '"iBlog 👥" <kevin.freistroffer@gmail.com>',
        to: "kevin.freistroffer@gmail.com", // TODO set this to the email
        subject: "Password Reset Confirmation",
        text:
          "Hi,\n\n" +
          "This is a confirmation that the password for your account has just been changed.\n",
      };

      // send mail with defined transport object
      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          throw err;
        }
      });

      return res.json(responses.success());
    } catch (error) {
      return res.status(500).json(responses.caught_error(error));
    }
  }
);

module.exports = router;
