"use strict";

import { users as mockUsers } from "../../../data/mock_users";
import config from "../../../../src/config";
import * as express from "express";

import * as bcrypt from "bcryptjs";
import { UserProjection } from "../../../defs/models/user.model";
import { body, validationResult } from "express-validator";
import { has } from "lodash";
import { ISanitizedUser, IUser } from "../../../defs/interfaces";
import {
  IResponseBody as _IResponseBody,
  IResponseBodyData,
  responses,
} from "../../../defs/responses";
import { findAll, findAllUsers } from "../../../operations/user_operations";
const router = express.Router();

interface IData extends IResponseBodyData {
  users?: ISanitizedUser[];
}
interface IResponseBody extends _IResponseBody {
  data: IData;
}

router.get(
  "/",
  async (req: express.Request, res: express.Response<IResponseBody>) => {
    try {
      console.log("[/users] reached...");

      const doc = await findAllUsers();

      return res.json({
        ...responses.success(),
        data: {
          ...responses.success().data,
          users: doc,
        },
      });
    } catch (error) {
      console.log("[/users] Caught error. Error: ", error);

      return res.status(500).json(responses.caught_error(error));
    }
  }
);

module.exports = router;
