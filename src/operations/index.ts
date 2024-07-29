// import mongodb, { ObjectId } from "mongodb";
// import { getConnectedClient, usersCollection } from "../db";
// import { IUser } from "../defs/interfaces";

// export const getUserById = async (
//   id: ObjectId,
//   fields: string[]
// ): Promise<Pick<IUser, Field extends keyof IUser> | null> => {
//   const projection: mongodb.FindOptions["projection"] = {};
//   fields.forEach((field) => {
//     projection[field] = 1;
//   });
//   const client = await getConnectedClient();
//   const users = await usersCollection(client);

//   const db = await getConnectedClient();
//   const result = await collection<User>("users").findOne(
//     { _id: id },
//     { projection }
//   );
//   return result;
// };
