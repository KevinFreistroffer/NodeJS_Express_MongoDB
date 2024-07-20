import * as express from "express";
import { User } from "../../../defs/models/user.model";
import mongoose, { Document, Types } from "mongoose";
import { body, validationResult } from "express-validator";
import { IJournal, ISanitizedUser, IUser } from "../../../defs/interfaces";
const { mock, test } = require("node:test");
const validatedUserId = body("userId") // TODO convert to zod?
  .notEmpty()
  .bail()
  .isString()
  .bail()
  .escape();
const validatedJournalIds = body("journalIds") // TODO convert to zod?
  .notEmpty()
  .bail()
  .isArray({ min: 1 })
  .bail()
  .custom((value) => value.every((id) => Types.ObjectId.isValid(id)))
  .escape();

interface IResponseBody {
  success: boolean;
  message: string;
  data: ISanitizedUser | undefined;
}
interface IRequestBody {
  userId: Types.ObjectId;
  journalIds: Types.ObjectId[];
}

const router = express.Router();

router.put(
  "/",
  validatedUserId,
  validatedJournalIds,
  async (req: express.Request<never, IResponseBody, IRequestBody>, res) => {
    try {
      console.log("[Journal/Delete] PUT reached");

      const validatedResults = validationResult(req);
      console.log("validatedResults", validatedResults);
      // Invalid request body
      if (!validatedResults.isEmpty()) {
        const errors = validatedResults.array();

        console.log("[Journal/Delete] Validation failed");
        return res.status(422).json({
          success: false,
          message:
            "Invalid request body. Make sure the userId and journalIds are valid MongoDB ObjectId's.",
          data: undefined,
        });
      }

      const { userId, journalIds } = req.body;
      const updatedDoc = await User.findOneAndUpdate(
        { _id: userId },
        { $pull: { journals: { _id: { $in: journalIds } } } },
        { new: true }
      );

      // If no update occurred, because of no user found, or no journalId's found
      if (!updatedDoc) {
        return res.json({
          success: false,
          message: "User not found or the journal(s) not found.",
          data: undefined,
        });
      }

      return res.json({
        success: true,
        message: "Successfull deleted the journals.",
        data: updatedDoc,
      });
    } catch (error) {
      return res.json({
        success: false,
        message: "Caught error: " + error,
        data: undefined,
      });
    }
  }
);

module.exports = router;
