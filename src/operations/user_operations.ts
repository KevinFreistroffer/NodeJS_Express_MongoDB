import {
  Collection,
  DeleteResult,
  Filter,
  FindOptions,
  InsertOneOptions,
  InsertOneResult,
  MongoClient,
  ObjectId,
  OptionalId,
  UpdateResult,
  WithId,
  WriteConcernError,
  WriteError,
} from "mongodb";
import { getClient, getConnectedClient, usersCollection } from "../db";
import { ISanitizedUser, IUser } from "../defs/interfaces";
import { UserProjection } from "../defs/models/user.model";

/**
 * Find one
 */
export async function findOne({
  query,
  sanitize,
}: {
  query: Filter<IUser>;
  sanitize: true;
}): Promise<WithId<ISanitizedUser>>;
export async function findOne({
  query,
  sanitize,
}: {
  query: Filter<IUser>;
  sanitize: false;
}): Promise<WithId<IUser>>;
export async function findOne({
  query,
  sanitize,
}: {
  query: Filter<IUser>;
  sanitize: boolean;
}): Promise<IUser | ISanitizedUser | null> {
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

/**
 * Find one by ID
 * @param id
 */
export const findOneById = async (id: ObjectId) =>
  await findOne({ query: { _id: id }, sanitize: true });

/**
 * Find one by email
 * @param email
 */
export const findOneByEmail = async (email: string) =>
  await findOne({ query: { email }, sanitize: true });

/**
 * Find one by username
 * @param username
 */
export const findOneByUsername = async (username: string) =>
  await findOne({ query: { username }, sanitize: true });

/**
 * Find one by username or email
 * @param username
 * @param email
 */
export const findOneByUsernameOrEmail = async (
  username: string,
  email: string
) =>
  await findOne({
    query: {
      $or: [{ username }, { email }],
    },
    sanitize: true,
  });

/**
 * Insert one
 * @param document
 */
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

/**
 * Update one
 * @param query
 * @param update
 */
export async function updateOne(
  query: Filter<IUser>,
  update: Record<string, any> // possible to set what key's are valid? username,
): Promise<UpdateResult<IUser>> {
  const client = await getClient();
  try {
    await client.connect();
    const doc = await usersCollection(client).updateOne(query, update);
    return doc;
  } catch (error) {
    // TODO: what type of errors? Handle specific errors?
    throw error;
  } finally {
    client.close();
  }
}

/**
 * Delete all documents
 */
export async function deleteMany(): Promise<DeleteResult> {
  const client = await getClient();
  try {
    await client.connect();
    return await usersCollection(client).deleteMany();
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
