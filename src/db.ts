import { MongoClient, ServerApiVersion } from "mongodb";
import config from "./config";

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

export const getClient = (): MongoClient => {
  console.log(getDBURI());
  return new MongoClient(getDBURI(), {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
    monitorCommands: true,
  });
};

export const getDB = async () => {
  const uri = getDBURI();
  const client: MongoClient = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });

  let conn = await client.connect();
  let db = conn?.db("user-journal");
  return db;
};

export const usersCollection = async () => {
  const db = await getDB();
  const users = await db.collection("users");

  return users;
};
