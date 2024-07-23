"use strict";

import { users as mockUsers } from "../../../data/mock_users";
import config from "../../../../src/config";
import * as express from "express";

import * as bcrypt from "bcryptjs";
import { User, UserProjection } from "../../../defs/models/user.model";
import { Types } from "mongoose";
import { body, validationResult } from "express-validator";
import { has } from "lodash";
import { ISanitizedUser, IUser, IUserDoc } from "../../../defs/interfaces";
import {
  IResponseBody,
  IResponseCode,
  responses,
} from "../../../defs/responses";
import { ObjectId } from "mongodb";
import { getDB, usersCollection } from "../../../db";
const router = express.Router();

router.get("/", async (req: express.Request, res: express.Response<any>) => {
  try {
    console.log("[/users] reached...");

    if (config.online) {
      const users = await usersCollection();
      // Find user by username or email
      const doc = await users.find().project(UserProjection).toArray();
      console.log(doc);

      if (!doc) {
        return res.json(responses.users_not_found());
      }

      return res.json({
        ...responses.success(),
        data: {
          ...responses.success().data,
          user: doc,
        },
      });
    } else {
      console.log("[/users] Offline handler.");

      return res.json({
        ...responses.success(),
        data: {
          ...responses.success().data,
          user: mockUsers as any, // TODO fix
        },
      });
    }
  } catch (error) {
    console.log("[/users] Caught error. Error: ", error);

    return res.status(500).json(responses.caught_error(error));
  }
});

module.exports = router;
