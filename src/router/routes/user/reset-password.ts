"use strict";

import * as express from "express";
import * as nodemailer from "nodemailer";
import config from "../../../../src/config";
import { body, validationResult } from "express-validator";
import { Types } from "mongoose";
import { User } from "../../../defs/models/user.model";
import { IResponseBody, responses } from "../../../defs/responses";
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
    req: express.Request<never, never, { token: string; password: string }>,
    res: express.Response<IResponseBody>
  ) => {
    try {
      const validatedErrors = validationResult(req).array();

      if (validatedErrors.length) {
        return res.status(422).json(responses.missing_body_fields());
      }

      const foundUser = await User.findOne({
        resetPasswordToken: req.body.token,
        resetPasswordExpires: { $gt: Date.now() },
      }).exec();
      console.log(foundUser);

      if (!foundUser) {
        return res.status(200).json(responses.user_not_found());
      }

      // Updating user object
      // TODO: sanitize the password?
      const hashedPassword = passwordHash.generate(req.body.password);
      foundUser.password = hashedPassword;
      // foundUser.resetPasswordToken = undefined;
      // foundUser.resetPasswordExpires = undefined;

      // Send Confirmation Email
      const transporter = nodemailer.createTransport(
        `smtps://${config.email.fromEmail}:${config.email.password}@smtp.gmail.com`
      );

      // setup e-mail data with unicode symbols
      const mailOptions = {
        from: '"iBlog 👥" <kevin.freistroffer@gmail.com>', // sender address
        to: "kevin.freistroffer@gmail.com", // list of receivers
        subject: "Password Reset Confirmation", // Subject line
        text:
          "Hello,\n\n" +
          "This is a confirmation that the password for your account " +
          foundUser.email +
          " has just been changed.\n",
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
