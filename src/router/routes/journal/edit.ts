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
import { getConnectedClient, usersCollection } from "../../../db";
import { ObjectId } from "mongodb";
import { verifyToken } from "../../../middleware";
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

interface IResponseBody {
  success: boolean;
  message: string;
  data:
    | Omit<
        IUser,
        | "password"
        | "usernameNormalized"
        | "emailNormalized"
        | "resetPasswordToken"
        | "resetPasswordExpires"
        | "jwtToken"
      >
    | undefined;
}
router.post(
  "/",
  validatedIds,
  async (
    req: express.Request<never, never, IRequestBody>,
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
        return res.status(422).json({
          success: false,
          message: "Invalid request body fields.",
          data: undefined,
        });
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
      const client = await getConnectedClient();
      const users = usersCollection(client);
      const doc = await users.findOneAndUpdate(
        {
          _id: new ObjectId(userId),
          "journals._id": new ObjectId(journalId),
        },
        {
          $set: query,
        }
        //{ new: true } // What is this?????
      );

      if (!doc) {
        return res.status(404).json({
          success: false,
          message: "User not found.",
          data: undefined,
        });
      }

      console.log(doc);

      return res.send({
        success: true,
        message: "Journal updated.",
        data: doc,
      });

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

      return res.status(500).json({
        success: false,
        message: "Caught error: " + error,
        data: undefined,
      });
    }
  }
);

module.exports = router;
