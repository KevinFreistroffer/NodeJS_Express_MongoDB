import { Document } from "mongoose";
import config from "./config";
import { Response } from "express";
import { responses } from "./defs/responses";

export const getDBURI = () => {
  return (
    "mongodb+srv://" +
    config.database.username +
    ":" +
    config.database.password +
    "@cluster0.7xxwju7.mongodb.net/" +
    config.database.databaseName +
    "?retryWrites=true&w=majority&appName=Cluster0"
  );
};

export const getDB = async () => {};

export const checkForForbiddenFields = (doc: Document) => {
  const forbiddenFields = ["password"];
};

export const createCaughtErrorResponse = (error: any) => {
  console.log(typeof error, error instanceof Error);
  return {
    ...responses.caught_error,
    data: {
      ...responses.caught_error.data,
      description: `Caught error: " ${
        error instanceof Error ? error.message : error
      }`,
    },
  };
};
