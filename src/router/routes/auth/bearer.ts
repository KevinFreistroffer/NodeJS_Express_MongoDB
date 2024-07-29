"use strict";

import { users as mockUsers } from "../../../data/mock_users";
import config from "../../../config";
import * as express from "express";
import { sign } from "jsonwebtoken";

const router = express.Router();

router.get(
  "/",
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.log(req.headers);
    const accessKey = req.headers["access-key"];
    console.log("accessKey", accessKey);

    if (typeof accessKey === "undefined" || accessKey !== config.apiAccessKey) {
      return res.sendStatus(401);
    }

    const jwtToken = sign({ data: "123" }, config.jwtSecret, {
      expiresIn: config.jwtTokenExpiresIn,
    });

    console.log("jwtToken", jwtToken);

    if (!jwtToken) {
      return res.status(500).json({
        success: false,
        message: "Failed to create JWT token.",
        data: undefined,
      });
    }

    res.locals.jwtToken = jwtToken;
    next();
  },
  async (
    req: express.Request<any, any, any>,
    res: express.Response<{ success: boolean; message: string; data: any }>
  ) => {
    try {
      console.log("[/auth/bearer] reached...");
      return res.status(200).json({
        success: true,
        message: "JWT created.",
        data: res.locals.jwtToken,
      });
    } catch (error) {
      console.log("[/auth-session] Caught error. Error: ", error);
      return res.status(500).json({
        success: false,
        message: "Caught error: " + error,
        data: undefined,
      });
    }
  }
);

module.exports = router;
