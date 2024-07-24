"use strict";

import config from "../../../../src/config";
import express from "express";
import moment from "moment";
import { User } from "../../../defs/models/user.model";

import { IResponse } from "../../../defs/interfaces";
import { body, validationResult } from "express-validator";
import { IResponseBody, responses } from "../../../defs/responses";
const days = ["Sun", "Mon", "Tue", "Wed", "Thur", "Fri", "Sat"];
const validatedUserId = body("userId") // TODO convert to zod?
  .notEmpty()
  .bail()
  .custom((id) => Types.ObjectId.isValid(id))
  .escape();
const validatedJournal = body(["title", "entry", "category"]) // TODO convert to zod?
  .notEmpty()
  .bail()
  .isString()
  .bail()
  .escape();
const router = express.Router();

router.post(
  "/",
  validatedUserId,
  validatedJournal,
  async (
    req: express.Request<
      never,
      never,
      {
        userId: string;
        title: string;
        entry: string;
        category: string;
      }
    >,
    res: express.Response<IResponseBody>
  ) => {
    try {
      console.log("[Journal/Create] POST reached");

      const validatedFields = validationResult(req);
      if (!validatedFields.isEmpty()) {
        console.log("[Journal/Create] Validation failed");

        return res.status(422).json(responses.missing_body_fields());
      }

      if (config.online) {
        const { userId, title, entry, category } = req.body;
        let day = moment().day();
        let date = `${days[day]}, ${moment().format("MM-DD-YYYY")}`;
        const journal = {
          title,
          entry,
          category,
          date, // convert to createdDate
          // add updatedDate
          selected: false, // ???
        };

        const doc = await User.findById(userId).exec();
        console.log(doc);

        if (!doc) {
          return res.json(responses.user_not_found());
        }

        // Add the category if it does not exist
        if (
          !doc.journalCategories.length ||
          !doc.journalCategories.some((c) => {
            console.log("c, category", c, category);
            return c.category.toLowerCase() === category.toLowerCase();
          })
        ) {
          console.log(
            "[journal/create] category does not exist in user.journalCategories"
          );
          doc.journalCategories.push({ category, selected: false });
        }
        doc.journals.push(journal);
        const savedDoc = await doc.save();
        console.log("savedDoc", savedDoc);

        return res.json(responses.success(savedDoc));
      } else {
        res.send(responses.success());
      }
    } catch (error) {
      console.log("Error finding a user while updating users journal", error);

      res.json(responses.caught_error(error));
    }
  }
);

module.exports = router;
