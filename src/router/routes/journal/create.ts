"use strict";

import config from "../../../../src/config";
import express from "express";
import moment from "moment";
// import { User } from "../../../defs/models/user.model";

import { IJournal, IResponse } from "../../../defs/interfaces";
import { body, validationResult } from "express-validator";
import { IResponseBody, responses } from "../../../defs/responses";
import { Types } from "mongoose";
import { getConnectedClient, usersCollection } from "../../../db";
import { ObjectId } from "mongodb";
import { verifyToken } from "../../../middleware";
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
  verifyToken,
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

      if (config.online) {
        const validatedFields = validationResult(req);

        // Invalid request body
        if (!validatedFields.isEmpty()) {
          console.log("[Journal/Create] Validation failed");

          return res.status(422).json(responses.missing_body_fields());
        }

        const { userId, title, entry, category } = req.body;
        let day = moment().day();
        let date = `${days[day]}, ${moment().format("MM-DD-YYYY")}`;
        const journal: IJournal = {
          title,
          entry,
          category,
          date, // convert to createdDate
          // add updatedDate
          selected: false, // ???
        };
        const client = await getConnectedClient();
        const users = usersCollection(client);

        // const doc = await users.findOneAndUpdate({ _id: new ObjectId(userId) });
        const doc = await users.updateOne(
          { _id: new ObjectId(userId) },
          {
            $addToSet: {
              journals: {
                ...journal,
              },
              journalCategories: {
                category,
                selected: false,
              },
            },
          },
          { upsert: false }
        );

        console.log(doc);
        // If the user exists, add the journal
        // If the journal category does not exist, add it

        if (!doc.acknowledged) {
          return res.json(responses.user_not_found());
        }

        return res.json(doc as any);
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
