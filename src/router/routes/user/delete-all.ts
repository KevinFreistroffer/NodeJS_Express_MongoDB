"use strict";

import { users as mockUsers } from "../../../data/mock_users";
import config from "../../../../src/config";
import * as express from "express";

import * as bcrypt from "bcryptjs";
import { User } from "../../../defs/models/user.model";
import { Types } from "mongoose";
import { body, validationResult } from "express-validator";
import { has } from "lodash";
import { IUser } from "../../../defs/interfaces";
import { IResponseBody, responses } from "../../../defs/responses";
const router = express.Router();

router.delete(
  "/",
  async (req: express.Request, res: express.Response<IResponseBody>) => {
    try {
      console.log("[/delete-all] reached...");

      if (config.online) {
        // Find user by username or email
        // TODO: how to get the updated doc?
        const doc = await User.deleteMany().exec();

        if (!doc) {
          throw new Error("Users not deleted. No error. Not sure why.");
        }

        // TODO: return []? Or fetch the db again, which is obviously the better idea.
        return res.json(responses.success());
      } else {
        console.log("[/delete-manhy] Offline handler.");

        return res.json(responses.success());
      }
    } catch (error) {
      console.log("[/delete-many] Caught error. Error: ", error);

      return res.status(500).json(responses.caught_error);
    }
  }
);

module.exports = router;
