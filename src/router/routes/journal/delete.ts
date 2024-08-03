import * as express from "express";
import { body, validationResult } from "express-validator";
import { IJournal, ISanitizedUser, IUser } from "../../../defs/interfaces";
import { Types } from "mongoose";
import { getConnectedClient, usersCollection } from "../../../db";
import { ObjectId } from "mongodb";
import { verifyToken } from "../../../middleware";

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
      const client = await getConnectedClient();
      const users = usersCollection(client);
      const updatedDoc = await users.updateOne(
        { _id: new ObjectId(userId) },
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
      // await users.updateOne(
      //   { _id: userId },
      //   {
      //     $pull: { journals: { _id: { $in: journalIds } } },
      //   }
      // );

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
        data: undefined, // !!!! set this to updatedDoc
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
