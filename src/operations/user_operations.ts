import {
  Collection,
  Filter,
  FindOptions,
  InsertOneOptions,
  InsertOneResult,
  MongoClient,
  ObjectId,
  OptionalId,
  WithId,
  WriteConcernError,
  WriteError,
} from "mongodb";
import { getClient, getConnectedClient, usersCollection } from "../db";
import { ISanitizedUser, IUser } from "../defs/interfaces";
import { UserProjection } from "../defs/models/user.model";

// FIND ONE
export async function findOne(
  query: Filter<IUser>,
  sanitize: true
): Promise<ISanitizedUser>;
export async function findOne(
  query: Filter<WithId<IUser>>,
  sanitize: false
): Promise<WithId<IUser>>;
export async function findOne(
  query: Filter<IUser>,
  sanitize: boolean = true
): Promise<IUser | ISanitizedUser | null> {
  const client = await getClient();

  try {
    await client.connect();
    return await usersCollection(client).findOne<IUser | ISanitizedUser>(
      query,
      {
        projection: sanitize ? UserProjection : undefined,
      }
    );
  } catch (error) {
    throw error;
  } finally {
    await client.close();
  }
}

export const findOneById = async (id: ObjectId) =>
  await findOne({ _id: id }, true);

export const findByUsernameOrEmail = async (username: string, email: string) =>
  await findOne(
    {
      $or: [{ username }, { email }],
    },
    true
  );

// INSERT ONE
export async function insertOne(
  document: OptionalId<IUser>
): Promise<InsertOneResult<IUser>> {
  const client = await getClient();
  try {
    await client.connect();
    return await usersCollection(client).insertOne(document);
  } catch (error) {
    // TODO: what type of errors? Handle specific errors?
    throw error;
  } finally {
    client.close();
  }
}

// // Create a new document
// async function createUser(document: IUser) {
//   const client = await getConnectedClient();

//   try {
//     await client.connect();
//     const users = await usersCollection(client);
//     const result = await users.insertOne(document);
//     console.log("Document created:", result.insertedId);

//     if (!result.acknowledged) {
//     }
//   } catch (error) {
//     console.error("Error creating document:", error);
//   } finally {
//     client.close();
//   }
// }

// // Update a document
// async function updateDocument(id: string, update: any) {
//   const client = new MongoClient(url);

//   try {
//     await client.connect();
//     const db = client.db(dbName);
//     const collection = db.collection(collectionName);
//     const result = await collection.updateOne(
//       { _id: new ObjectId(id) },
//       { $set: update }
//     );
//     console.log("Document updated:", result.modifiedCount);
//   } catch (error) {
//     console.error("Error updating document:", error);
//   } finally {
//     client.close();
//   }
// }

// //

// // Delete a document
// async function deleteDocument(id: string) {
//   const client = new MongoClient(url);

//   try {
//     await client.connect();
//     const db = client.db(dbName);
//     const collection = db.collection(collectionName);
//     const result = await collection.deleteOne({ _id: new ObjectId(id) });
//     console.log("Document deleted:", result.deletedCount);
//   } catch (error) {
//     console.error("Error deleting document:", error);
//   } finally {
//     client.close();
//   }
// }
// async function getUserById(id: string) {
//   const client = new MongoClient(url);
//   try {
//     const client = getClient();
//     const user = usersCollection(client);
//     const result = await user.findOne({ _id: new ObjectId(id) });
//     console.log("Document result:", result?._id);
//   } catch (error) {
//     console.error("Error result document:", error);
//   } finally {
//     client.close();
//   }
// }
