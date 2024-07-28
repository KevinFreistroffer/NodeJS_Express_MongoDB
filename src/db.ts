import { Collection, Document, MongoClient, ServerApiVersion } from "mongodb";
import config from "./config";
import { ISession, IUser } from "./defs/interfaces";

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

export const getConnectedClient = async () => {
  const uri = getDBURI();
  const client: MongoClient = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });

  await client.connect();
  return client;
};

export const usersCollection = (client: MongoClient) => {
  const db = client.db("user-journal");
  //www.mongodb.com/resources/products/compatibilities/using-typescript-with-mongodb-tutorial
  // await db.command({
  //   collMod: "process.env.GAMES_COLLECTION_NAME",
  //   validator: {
  //     $jsonSchema: {
  //       bsonType: "object",
  //       required: ["name", "price", "category"],
  //       additionalProperties: false,
  //       properties: {
  //         _id: {},
  //         name: {
  //           bsonType: "string",
  //           description: "'name' is required and is a string",
  //         },
  //         price: {
  //           bsonType: "number",
  //           description: "'price' is required and is a number",
  //         },
  //         category: {
  //           bsonType: "string",
  //           description: "'category' is required and is a string",
  //         },
  //       },
  //     },
  //   },
  // });

  return db.collection<IUser>("users") as Collection<IUser>;
};

export const sessionsCollection = (client: MongoClient) => {
  const sessions = client
    .db("user-journal")
    .collection<ISession>("sessions") as Collection<ISession>;

  return sessions;
};
