"use strict";

import { users as mockUsers } from "../../../data/mock_users";
import config from "../../../../src/config";
import * as express from "express";

const router = express.Router();

router.get(
  "/",
  async (
    req: express.Request,
    res: express.Response<{ success: boolean; message: string; data: any }>
  ) => {
    try {
      console.log("[/auth-session] reached...");
      console.log(req.headers);

      if (config.online) {
        return res.status(404).json({
          success: false,
          message: "User doesn't exist. Cannot to log in.",
          data: undefined,
        });
      } else {
        console.log("Offline auth-session handler.");
        res.json({
          success: true,
          message: "Offline.",
          data: undefined,
        });

        return;
      }
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
