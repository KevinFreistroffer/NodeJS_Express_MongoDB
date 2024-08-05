import request from "supertest";
import { getClient, usersCollection } from "../src/db";
import { IUser } from "../src/defs/interfaces";
import { ObjectId } from "mongodb";
const { MongoClient } = require("mongodb");

describe("insert", () => {
  let connection;
  let db;

  beforeAll(async () => {
    connection = await getClient().connect();
  });

  afterAll(async () => {
    await connection.close();
  });

  it("should insert a doc into collection", async () => {
    const users = await usersCollection(connection);

    const mockUser = {
      username: "username",
      usernameNormalized: "username".toLowerCase(),
      email: "email@gmail.com",
      emailNormalized: "email@gmail.com",
      password: "password",
      resetPasswordToken: "",
      // jwtToken: "",
      journals: [],
      journalCategories: [],
    };

    const doc = await users.insertOne(mockUser);

    const insertedUser = await users.findOne<IUser>({
      _id: doc.insertedId,
    });
    expect(insertedUser).toEqual(mockUser);
  });
});
