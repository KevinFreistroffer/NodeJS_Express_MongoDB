"use strict";

import config from "../../../../src/config";
import express from "express";
import moment from "moment";
// import { User } from "../../../defs/models/user.model";

import { IJournal, IResponse, ISanitizedUser } from "../../../defs/interfaces";
import { body, validationResult } from "express-validator";
import { IResponseBody, responses } from "../../../defs/responses";
import { Types } from "mongoose";
import { getConnectedClient, usersCollection } from "../../../db";
import { ObjectId } from "mongodb";
import { verifyToken } from "../../../middleware";
import { UserProjection } from "../../../defs/models/user.model";
const router = express.Router();
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

interface IRequestBody {
  userId: string;
  title: string;
  entry: string;
  category: string;
}

router.post(
  "/",
  verifyToken,
  validatedUserId,
  validatedJournal,
  async (
    req: express.Request<never, never, IRequestBody>,
    res: express.Response<IResponseBody>
  ) => {
    try {
      console.log("[Journal/Create] POST reached");

      /*--------------------------------------------------
       *  Validate request body.
       *------------------------------------------------*/
      const validatedFields = validationResult(req);
      if (!validatedFields.isEmpty()) {
        console.log("[Journal/Create] Validation failed");

        return res.status(422).json(responses.missing_body_fields());
      }

      /*--------------------------------------------------
       * Valid request body.
       * MongoDB User collection
       *------------------------------------------------*/
      const { userId, title, entry, category } = req.body;
      const client = await getConnectedClient();
      const users = usersCollection(client);
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

      /*--------------------------------------------------
       *  Update user's journals
       *------------------------------------------------*/
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

      if (!doc.acknowledged || !doc.upsertedId) {
        return res.json(responses.error_updating_user());
      }

      const foundDoc = await users.findOne(
        { _id: new ObjectId(doc.upsertedId) },
        { projection: UserProjection }
      );

      if (!foundDoc) {
        return res.json(responses.user_not_found());
      }

      return res.json(responses.success(foundDoc));
    } catch (error) {
      console.log("[/journal/create] caught error", error);

      res.json(responses.caught_error(error));
    }
  }
);

module.exports = router;
