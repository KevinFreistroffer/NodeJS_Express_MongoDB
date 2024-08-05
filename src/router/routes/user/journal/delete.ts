import * as express from "express";
import { body, validationResult } from "express-validator";
import { IJournal, ISanitizedUser, IUser } from "../../../defs/interfaces";
import { Types } from "mongoose";
import { usersCollection } from "../../../db";
import { ObjectId } from "mongodb";
import { verifyToken } from "../../../middleware";
import { updateOne } from "../../../operations/user_operations";
import { IResponseBody, responses } from "../../../defs/responses";

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

interface IRequestBody {
  userId: Types.ObjectId;
  journalIds: Types.ObjectId[];
}

const router = express.Router();

router.put(
  "/",
  validatedUserId,
  validatedJournalIds,
  async (
    req: express.Request<any, any, IRequestBody>,
    res: express.Response<IResponseBody>
  ) => {
    try {
      console.log("[Journal/Delete] PUT reached");

      const validatedResults = validationResult(req);
      console.log("validatedResults", validatedResults);
      // Invalid request body
      if (!validatedResults.isEmpty()) {
        const errors = validatedResults.array();

        console.log("[Journal/Delete] Validation failed");
        return res.status(422).json(responses.missing_body_fields());
      }

      const { userId, journalIds } = req.body;
      const updatedDoc = await updateOne(
        { _id: userId },
        {
          $pull: {
            journals: {
              _id: {
                $in: journalIds,
              },
            },
          },
        }
      );

      if (!updatedDoc.matchedCount) {
        return res.json(responses.user_not_found());
      }

      if (!updatedDoc.modifiedCount) {
        return res.json(responses.user_not_found());
      }

      return res.json(responses.success());
    } catch (error) {
      return res.json(responses.caught_error(error));
    }
  }
);

module.exports = router;
