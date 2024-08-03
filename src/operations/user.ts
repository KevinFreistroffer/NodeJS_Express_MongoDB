import {
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
import { Collection } from "mongoose";

async function insertOne(
  collection: Collection<IUser>,
  document: OptionalId<IUser>,
  options?: InsertOneOptions | undefined
): Promise<InsertOneResult<IUser>> {
  try {
    const result = await collection.insertOne(document);

    return result;
  } catch (error) {
    // writeErrror
    // writeConvertionError

    if (error instanceof WriteError) {
      // ...
    }

    if (error instanceof WriteConcernError) {
      // ...
    }
    throw error;
  }
}

async function findOneById(
  collection: Collection<IUser>,
  id: ObjectId
  // options: FindOptions<Document> = { projection: UserProjection } // incompatible types, why?
): Promise<WithId<IUser> | null> {
  try {
    //www.mongodb.com/docs/manual/reference/command/find/#mongodb-dbcommand-dbcmd.find
    const result = await collection.findOne(
      { _id: id },
      { projection: UserProjection }
    );

    return result;
  } catch (error) {
    // writeErrror
    // writeConvertionError

    if (error instanceof WriteError) {
      // ...
    }

    if (error instanceof WriteConcernError) {
      // ...
    }
    throw error;
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

// Read documents
export async function findByUsernameOrEmail(username: string, email: string) {
  const client = await getConnectedClient();

  try {
    await client.connect();
    const users = await usersCollection(client);
    return await users.findOne<ISanitizedUser>(
      {
        $or: [{ username }, { email }],
      },
      { projection: UserProjection }
    );
  } catch (error) {
    console.error("[findByUsernameOrEmail] Caught Error:" + error, error);

    throw new Error("Error finding user by username or email:" + error);
  } finally {
    client.close();
  }
}

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
