import * as express from "express";
import { UserProjection } from "../../../defs/models/user.model";
import { IJournal } from "../../../defs/interfaces";
import { getConnectedClient, usersCollection } from "../../../db";
import { ObjectId } from "mongodb";
import { verifyToken } from "../../../middleware";
import {
  IResponseBody,
  IResponseBodyData,
  responses,
} from "../../../defs/responses";
const router = express.Router();

interface IData extends IResponseBodyData {
  journals?: IJournal[];
}

interface _IResponseBody extends IResponseBody {
  data: IData;
}

router.get(
  "/:userId",
  async (
    req: express.Request<{ userId: string }>,
    res: express.Response<_IResponseBody>
  ) => {
    console.log("[Journal/Journals] GET reached", req.params.userId);
    try {
      if (
        !req.params.userId ||
        req.params.userId === "" ||
        !ObjectId.isValid(req.params.userId)
      ) {
        return res.status(422).json(responses.missing_body_fields());
      }
      const client = await getConnectedClient();
      const users = usersCollection(client);
      const doc = await users.findOne(
        { _id: new ObjectId(req.params.userId) },
        { projection: UserProjection }
      );

      if (!doc) {
        return res.status(404).json(responses.user_not_found());
      }
      res.status(200).json({
        ...responses.success(),
        data: {
          ...responses.success().data,
          journals: doc.journals,
        },
      });
    } catch (error) {
      res.status(500).json(responses.caught_error(error));
    }
  }
);

module.exports = router;
