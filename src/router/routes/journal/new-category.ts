"use strict";

import config from "../../../../src/config";
import * as express from "express";
import { User } from "../../../defs/models/user.model";

import { body, validationResult } from "express-validator";
import { IResponse } from "../../../defs/interfaces";

const validatedUserId = body("userId") // TODO convert to zod?
  .notEmpty()
  .bail()
  .custom((id) => Types.ObjectId.isValid(id))
  .bail()
  .escape();
const validatedJournal = body("category") // TODO convert to zod?
  .notEmpty()
  .bail()
  .isString()
  .bail()
  .custom((category) => typeof category === "string")
  .escape();
const router = express.Router();

router.post(
  "/",
  validatedUserId,
  validatedJournal,
  async (
    req: express.Request<never, never, { userId: string; category: string }>,
    res: express.Response<IResponse>
  ) => {
    console.log("[Journal/NewCategory] POST reached");

    try {
      console.log("req.body", req.body);

      const validatedFields = validationResult(req);

      if (!validatedFields.isEmpty()) {
        console.log("[Journal/NewCategory] Validation failed");

        return res.status(422).json({
          success: false,
          message: "Invalid request body.",
          data: undefined,
        });
      }

      if (config.online) {
        const { userId, category } = req.body;

        const doc = await User.findById(userId).exec();

        if (!doc) {
          return res.json({
            success: false,
            message: "User not found.",
            data: undefined,
          });
        } else {
          //console.log( "foundUser", foundUser );
          console.log(doc.journalCategories);
          let categoryExists = doc.journalCategories.length
            ? doc.journalCategories.some((categoryDoc) => {
                console.log(categoryDoc.category, typeof categoryDoc.category);
                return (
                  category.toLowerCase() === categoryDoc.category.toLowerCase()
                );
              })
              ? true
              : false
            : false;

          if (categoryExists) {
            res.status(409).json({
              success: false,
              message: "Category already exists.",
              data: undefined,
            });

            return;
          } else {
            doc.journalCategories.push({ category, selected: false });
            const savedDoc = await doc.save();
            console.log("savedDoc", savedDoc);

            if (!savedDoc) {
              throw new Error("Could not save the new category.");
            }

            return res.send({
              success: true,
              message: "Saved the category.",
              data: savedDoc,
            });
          }
        }
      } else {
        res.send({
          success: false,
          message: "Offline, unable to save a new category. Try again later.",
          data: undefined,
        });
      }
    } catch (error) {
      console.log("Error while adding a category", error);
      res.status(500).json({
        success: false,
        message: "Caught error: " + error,
        data: undefined,
      });
    }
  }
);

module.exports = router;
