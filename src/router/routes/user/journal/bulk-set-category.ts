import config from "../../../../src/config";
import {
  ICategory,
  IJournalDoc,
  ISanitizedUser,
  IUser,
  // IUserDoc,
} from "../../../defs/interfaces";
// import { User } from "../../../defs/models/user.model";
import * as express from "express";
import { body, validationResult } from "express-validator";
import {
  IResponseBody,
  IResponseBodyData,
  responses,
} from "../../../defs/responses";
import { usersCollection } from "../../../db";
import { ObjectId } from "mongodb";
import { verifyToken } from "../../../middleware";
import { convertDocToSafeUser } from "../../../utils";
import { UserProjection } from "../../../defs/models/user.model";
import { findOneById, updateOne } from "../../../operations/user_operations";

const router = express.Router();

const validatedJournalIds = body("journalIds")
  .isArray({ min: 1 })
  .bail()
  .custom((value) => value.every((id: string) => ObjectId.isValid(id)))
  .bail()
  .escape();
const validatedStrings = body(["userId", "category"])
  .notEmpty()
  .bail()
  .isString()
  .bail()
  .escape();

router.post(
  "/",
  validatedStrings,
  validatedJournalIds,
  async (
    req: express.Request<
      never,
      never,
      { userId: string; journalIds: string[]; category: string }
    >,
    res: express.Response<IResponseBody>
  ) => {
    console.log("[journal/bulk-set-category] req.body", req.body);

    try {
      /*--------------------------------------------------
       *  Validate the request body
       *------------------------------------------------*/
      const validatedFields = validationResult(req);
      if (!validatedFields.isEmpty()) {
        console.log(validatedFields);
        return res.status(422).json(responses.missing_body_fields());
      }

      const { userId, journalIds, category } = req.body;

      const doc = await findOneById(new ObjectId());

      /*--------------------------------------------------
       *  User not found
       *------------------------------------------------*/
      if (!doc) {
        return res.json(responses.user_not_found());
      }

      /*--------------------------------------------------
       *  Set the journal category on each journal
       *------------------------------------------------*/
      doc.journals.forEach((journal) => {
        if (
          journalIds.includes(
            ((journal as IJournalDoc)._id as ObjectId).toString()
          )
        ) {
          journal.category = category;
        }
      });

      /*--------------------------------------------------
       *  Save the updated user.journals
       *------------------------------------------------*/
      const updatedDoc = await updateOne(
        { _id: new ObjectId(userId) },
        {
          $set: {
            journals: doc.journals,
          },
        }
      );

      if (!updatedDoc.acknowledged) {
        return res.json(responses.error_updating_user());
      }

      const savedDoc = await findOneById(new ObjectId(userId));

      if (!savedDoc) {
        return res.json(
          responses.user_not_found(
            "Categories successfully updated, however finding the updated user returned no doc. Try again."
          )
        );
      }

      return res.json(responses.success(savedDoc));
    } catch (error) {
      return res.status(500).json(responses.caught_error(error));
    }
  }
);

module.exports = router;
