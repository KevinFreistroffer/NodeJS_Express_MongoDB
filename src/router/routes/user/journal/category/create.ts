"use strict";

import config from "../../../../config";
import * as express from "express";

import { body, validationResult } from "express-validator";
import { IResponse } from "../../../../defs/interfaces";
import { Types } from "mongoose";
import { usersCollection } from "../../../../db";
import { ObjectId } from "mongodb";
import { verifyToken } from "../../../../middleware";
import { updateOne } from "../../../../operations/user_operations";
import { IResponseBody, responses } from "../../../../defs/responses";

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
    req: express.Request<any, any, { userId: string; category: string }>,
    res: express.Response<IResponseBody>
  ) => {
    console.log("[Journal/NewCategory] POST reached");

    try {
      console.log("req.body", req.body);

      const validatedFields = validationResult(req);

      if (!validatedFields.isEmpty()) {
        console.log("[Journal/NewCategory] Validation failed");

        return res.status(422).json(responses.missing_body_fields());
      }

      const { userId, category } = req.body;
      const doc = await updateOne(
        {
          _id: new ObjectId(userId),
          journalCategories: { $not: { $elemMatch: { category } } },
        },
        {
          $addToSet: {
            journalCategories: {
              category,
              selected: false,
            },
          },
        }
      );

      console.log("doc", doc);

      if (!doc.matchedCount) {
        return res.json(
          responses.user_not_found(
            "User not found, or the category already exists."
          )
        );
      }

      if (doc.modifiedCount === 0) {
        return res.json(responses.error_updating_user("User not updated."));
      }

      return res.json(responses.success());
    } catch (error) {
      console.log("Error while adding a category", error);
      res.status(500).json(responses.caught_error(error));
    }
  }
);

module.exports = router;
