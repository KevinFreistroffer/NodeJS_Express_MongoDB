import { Collection, MongoClient, ServerApiVersion } from "mongodb";
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

export const getMongoClient = (): MongoClient => {
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

  await client.connect();
  return client.db("user-journal");
};

const dbConnect = async () => {
  const client = getMongoClient();
  await client.connect();
  return client;
};

export const usersCollection = (client: MongoClient) => {
  const users = client.collection<IUser>("users") as Collection<IUser>;

  return users;
};

export const sessionsCollection = (client: MongoClient) => {
  client.db("user-journal");
  const sessions = db.collection<ISession>("sessions") as Collection<ISession>;

  return sessions;
};
