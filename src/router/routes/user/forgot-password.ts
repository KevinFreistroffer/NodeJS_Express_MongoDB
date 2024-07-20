"use strict";

import * as express from "express";
import * as nodemailer from "nodemailer";
import config, { EStage } from "../../../../src/config";
import { User } from "../../../defs/models/user.model";
import { Types } from "mongoose";
import { body, validationResult } from "express-validator";
import { ISanitizedUser } from "../../../defs/interfaces";
import { IResponseBody, responses } from "../../../defs/responses";
const router = express.Router();
let crypto = require("node:crypto");

router.post(
  "/",
  body("email").isEmail().bail().normalizeEmail(),
  async (
    req: express.Request<never, never, { email: string }>,
    res: express.Response<IResponseBody>
  ) => {
    console.log("[user/forgot-password] reached...");
    try {
      if (config.online) {
        const validatedErrors = validationResult(req).array();

        if (validatedErrors.length) {
          return res.status(422).json(responses.missing_body_fields());
        }

        // Look for a user based on their email
        const foundUser = await User.findOne({ email: req.body.email }).exec();
        /*--------------------------------------------------
         * User NOT found
         *------------------------------------------------*/
        if (!foundUser) {
          console.log("no user found");

          return res.status(200).json(responses.user_not_found());
        }

        /*--------------------------------------------------
         * User found
         *------------------------------------------------*/
        // Generate a password reset token.
        const token = crypto.randomBytes(20).toString("hex");
        foundUser.resetPasswordToken = token;
        // Set token expiration time to 3 hours.
        const date = new Date();
        const hoursToAdd = 3 * 60 * 60 * 1000; // 3 hours
        date.setTime(date.getTime() + hoursToAdd);
        foundUser.resetPasswordExpires = date;
        // Save the user.
        const savedUser = await foundUser.save();

        /*--------------------------------------------------
         * Send the password reset email
         *------------------------------------------------*/
        const transporter = nodemailer.createTransport(
          "smtps://" +
            config.email.fromEmail +
            ":" +
            config.email.password +
            "@smtp.gmail.com"
        );
        const mailOptions = {
          from: `Password Reset 👥 <${config.email.fromEmail}>`, // sender address
          to: `${
            config.env === EStage.DEVELOPMENT
              ? config.email.fromEmail
              : foundUser.email
          }`, // list of receivers
          subject: "Reset Password", // Subject line
          text:
            "Click the link to change your password. This link will be good for 3 hours: http://" +
            req.headers.host +
            "#/reset-password/" +
            token +
            "\n\n", // plaintext body
          html:
            "Click the link to change your password. This link will be good for 3 hours: <br /> <h1 style=\"font-size: 16px; font-family: 'Tahoma', geneva, sans-serif; color: #333 !important; padding: 10px 0;\">http://" +
            req.headers.host +
            "#/reset-password/" +
            token +
            "</h1>" +
            "\n\n", // html body
        };
        transporter.sendMail(mailOptions, (emailSendError) => {
          if (emailSendError) {
            throw new Error(
              "Error sending reset password email. Error: " + emailSendError
            );
          }
        });

        return res.json(responses.success());
      } else {
        console.log("[OFFLINE user/forgot-password]. Cancelling request.");
        return res.json(responses.success());
      }
    } catch (error) {
      return res.status(500).json(responses.caught_error(error));
    }
  }
);

module.exports = router;
