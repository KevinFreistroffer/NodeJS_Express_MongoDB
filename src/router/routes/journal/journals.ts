import * as express from "express";
import { User } from "../../../defs/models/user.model";
import { IJournal } from "../../../defs/interfaces";
const router = express.Router();

interface IResponseBody {
  success: boolean;
  message: string;
  data: IJournal[] | undefined;
}

router.get(
  "/:userId",
  async (req: express.Request, res: express.Response<IResponseBody>) => {
    console.log("[Journal/Journals] GET reached", req.params.userId);
    try {
      if (!req.params.userId) {
        return res.status(422).json({
          success: false,
          message: "Invalid request body fields.",
          data: undefined,
        });
      }

      const doc = await User.findById(req.params.userId).populate("journals");
      if (doc) {
        res.status(200).json({
          success: true,
          message: "User found.",
          data: doc.journals,
        });
      } else {
        res.status(200).json({
          success: true,
          message: "User not found.",
          data: undefined,
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Caught error: " + error,
        data: undefined,
      });
    }
  }
);

module.exports = router;
