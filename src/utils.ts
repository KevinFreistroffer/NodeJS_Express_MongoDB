import { Document } from "mongoose";
import config from "./config";
import { Response } from "express";
import { responses } from "./defs/responses";
import { MongoClient, ServerApiVersion } from "mongodb";

export const checkForForbiddenFields = (doc: Document) => {
  const forbiddenFields = ["password"];
};
