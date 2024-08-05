"use strict";

import config from "../../../../src/config";
import * as express from "express";
import {
  IJournal,
  IJournalDoc,
  IResponse,
  IUser,
} from "../../../defs/interfaces";
import { body, validationResult } from "express-validator";
import { has } from "lodash";
import { usersCollection } from "../../../db";
import { ObjectId } from "mongodb";
import { verifyToken } from "../../../middleware";
import { findOneById, updateOne } from "../../../operations/user_operations";
import { IResponseBody, responses } from "../../../defs/responses";
const router = express.Router();
const validatedIds = body(["userId", "journalId"]) // TODO convert to zod?
  .notEmpty()
  .bail()
  .isString()
  .bail()
  .escape();

interface IRequestBody {
  userId: string;
  journalId: string;
  title: string | undefined;
  entry: string | undefined;
  category: string | undefined;
}

router.post(
  "/",
  validatedIds,
  async (
    req: express.Request<any, any, IRequestBody>,
    res: express.Response<IResponseBody>
  ) => {
    console.log("[Journal/Edit] POST reached");
    try {
      const validatedFields = validationResult(req);

      if (
        !validatedFields.isEmpty() ||
        (!has(req.body, "title") &&
          !has(req.body, "entry") &&
          !has(req.body, "category"))
      ) {
        return res.status(422).json(responses.missing_body_fields());
      }

      console.log(validatedFields);
      const { userId, journalId, title, entry, category } = req.body;
      console.log("req.body", req.body);

      const query: {
        ["journals.$.title"]?: string;
        ["journals.$.entry"]?: string;
        ["journals.$.category"]?: string;
      } = {};

      if (title) {
        query["journals.$.title"] = title;
      }

      if (entry) {
        query["journals.$.entry"] = entry;
      }

      if (category) {
        query["journals.$.category"] = category;
      }

      const doc = await updateOne(
        {
          _id: new ObjectId(userId),
          "journals._id": new ObjectId(journalId),
        },
        {
          $set: query,
        }
        //{ new: true } // What is this?????
      );

      if (!doc.matchedCount) {
        return res.status(404).json(responses.user_not_found());
      }

      if (!doc.modifiedCount) {
        return res.json(responses.error_updating_user());
      }

      const userDoc = await findOneById(new ObjectId(userId));

      if (!userDoc) {
        res.json(
          responses.user_not_found("Could not find the updated server.")
        );
      }

      return res.send(responses.success(userDoc));

      // doc.journals.forEach((journal) => {
      //   if ((journal as IJournalDoc)._id?.toString() === journalId) {
      //     if (title) {
      //       query["journals.$.title"] = title;
      //       journal.title = title;
      //     }

      //     if (entry) {
      //       query["journals.$.entry"] = entry;
      //       journal.entry = entry;
      //     }

      //     if (category) {
      //       query["journals.$.category"] = category;
      //       journal.category = category;
      //     }
      //   }
      // });
    } catch (error) {
      console.log("Error updated users journal: ", error);

      return res.status(500).json(responses.caught_error(error));
    }
  }
);

module.exports = router;
