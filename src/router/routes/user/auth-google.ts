import * as mockUsers from "../../../data/mock_users";
import config from "../../../../src/config";
import * as express from "express";
import jwt from "jsonwebtoken";
import * as bcrypt from "bcryptjs";
import { User } from "../../../defs/models/user.model";
const router = express.Router();

// router.get(
//   'auth/google',
//   passport.authenticate('google', {
//     scope: ["profile", "email"]
//   }
// );
//
// router.get(
//   'auth/google/callback',
//   passport.authenticate('google'), async (req: express.Request, res: express.Response<string>) => {
//     res.redirect('/dashboard');
//   }
// );
module.exports = router;
