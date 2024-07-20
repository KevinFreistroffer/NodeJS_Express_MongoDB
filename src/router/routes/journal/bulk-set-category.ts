import { Document, Types } from "mongoose";
import config from "../../../../src/config";
import {
  ICategory,
  IJournalDoc,
  ISanitizedUser,
  IUser,
  IUserDoc,
} from "../../../defs/interfaces";
import { User } from "../../../defs/models/user.model";
import * as express from "express";
import { body, validationResult } from "express-validator";
import {
  IResponseBody,
  IResponseCode,
  responses,
} from "../../../defs/responses";

const router = express.Router();

const validatedJournalIds = body("journalIds")
  .isArray({ min: 1 })
  .bail()
  .custom((value) => value.every((id: string) => Types.ObjectId.isValid(id)))
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
      const validatedFields = validationResult(req);
      if (!validatedFields.isEmpty()) {
        console.log(validatedFields);
        return res.status(422).json(responses.missing_body_fields);
      }
      const { userId, journalIds, category } = req.body;
      console.log(req.body);

      if (config.online) {
        // [TODO] mongoose method to do this
        const doc:
          | (Document<unknown, any, IUserDoc> & IUser & { _id: Types.ObjectId })
          | null = await User.findById(userId).exec();

        if (!doc) {
          return res.json(responses.user_not_found());
        }

        doc.journals.forEach((journal) => {
          if (
            journalIds.includes(
              ((journal as IJournalDoc)._id as Types.ObjectId).toString()
            )
          ) {
            journal.category = category;
          }
        });

        const savedDoc = await doc.save();
        console.log("savedDoc", savedDoc);

        return res.json(responses.success(savedDoc));
      } else {
        res.send(responses.success());
      }
    } catch (error) {
      return res.status(500).json(responses.caught_error);
    }
  }
);

module.exports = router;
