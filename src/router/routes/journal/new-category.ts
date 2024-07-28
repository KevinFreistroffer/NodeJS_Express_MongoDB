"use strict";

import config from "../../../../src/config";
import * as express from "express";

import { body, validationResult } from "express-validator";
import { IResponse } from "../../../defs/interfaces";
import { Types } from "mongoose";
import { getConnectedClient, usersCollection } from "../../../db";
import { ObjectId } from "mongodb";

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
          message:
            "Invalid request body. Make sure the userId is a valid MongoDB ObjectId.",
          data: undefined,
        });
      }

      if (config.online) {
        const { userId, category } = req.body;
        const client = await getConnectedClient();
        const users = usersCollection(client);
        const doc = await users.updateOne(
          { _id: new ObjectId(userId) },
          {
            $addToSet: {
              journalCategories: {
                category,
                selected: false,
              },
            },
          },
          { upsert: false }
        );

        console.log("doc", doc);

        if (!doc.acknowledged) {
          return res.json({
            success: false,
            message: "User not found.",
            data: undefined,
          });
        }

        if (doc.modifiedCount === 0) {
          return res.json({
            success: true,
            message: "Category already exists.",
            data: undefined,
          });
        }

        return res.json({
          success: true,
          message: "Category saved.", // Might need to get the user, and check if the category already exists
          data: undefined,
        });
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
