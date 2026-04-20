import type {
  Adapter,
  AdapterAccount,
  AdapterUser,
  AdapterSession,
  VerificationToken,
} from "next-auth/adapters";
import clientPromise from "./mongodb";
import { ObjectId, Collection } from "mongodb";

const COLLECTIONS = {
  users: "users",
  accounts: "accounts",
  sessions: "sessions",
  verificationTokens: "verificationTokens",
} as const;

let indexesCreated = false;

async function ensureIndexes() {
  if (indexesCreated) return;
  
  const client = await clientPromise;
  const db = client.db("inboxflow");
  
  // Users: unique email index
  await db.collection<AdapterUser>(COLLECTIONS.users).createIndex(
    { email: 1 },
    { unique: true, sparse: true }
  );
  
  // Accounts: compound unique index
  await db.collection<AdapterAccount>(COLLECTIONS.accounts).createIndex(
    { provider: 1, providerAccountId: 1 },
    { unique: true }
  );
  
  // Sessions: unique sessionToken
  await db.collection<AdapterSession>(COLLECTIONS.sessions).createIndex(
    { sessionToken: 1 },
    { unique: true }
  );
  
  // VerificationTokens: unique identifier+token
  await db.collection<VerificationToken>(COLLECTIONS.verificationTokens).createIndex(
    { identifier: 1, token: 1 },
    { unique: true }
  );
  
  indexesCreated = true;
  console.log("MongoDB indexes created for NextAuth adapter");
}

export function MongoDBAdapter(clientPromiseOverride?: Promise<any>): Adapter {
  return {
    async createUser(userData) {
      try {
        await ensureIndexes();
        const client = await (clientPromiseOverride || clientPromise);
        const db = client.db("inboxflow");
        const result = await db.collection<AdapterUser>(COLLECTIONS.users).insertOne({
          ...userData,
          _id: new ObjectId(),
        });
        return {
          id: result.insertedId.toString(),
          ...userData,
        };
      } catch (error) {
        console.error("createUser error:", error);
        throw error;
      }
    },

    async getUser(id) {
      try {
        const client = await (clientPromiseOverride || clientPromise);
        const db = client.db("inboxflow");
        const user = await db.collection<AdapterUser>(COLLECTIONS.users).findOne({
          _id: new ObjectId(id),
        });
        if (!user) return null;
        const { _id, ...rest } = user;
        return {
          id: _id.toString(),
          ...rest,
        };
      } catch (error) {
        console.error("getUser error:", error);
        return null;
      }
    },

    async getUserByEmail(email) {
      try {
        const client = await (clientPromiseOverride || clientPromise);
        const db = client.db("inboxflow");
        const user = await db.collection<AdapterUser>(COLLECTIONS.users).findOne({
          email: email.toLowerCase().trim(),
        });
        if (!user) return null;
        const { _id, ...rest } = user;
        return {
          id: _id.toString(),
          ...rest,
        };
      } catch (error) {
        console.error("getUserByEmail error:", error);
        return null;
      }
    },

    async getUserByAccount({ providerAccountId, provider }) {
      try {
        const client = await (clientPromiseOverride || clientPromise);
        const db = client.db("inboxflow");
        
        const account = await db.collection<AdapterAccount>(COLLECTIONS.accounts).findOne({
          providerAccountId,
          provider,
        });
        
        if (!account) return null;
        
        const user = await db.collection<AdapterUser>(COLLECTIONS.users).findOne({
          _id: new ObjectId(account.userId),
        });
        
        if (!user) return null;
        
        const { _id, ...rest } = user;
        return {
          id: _id.toString(),
          ...rest,
        };
      } catch (error) {
        console.error("getUserByAccount error:", error);
        return null;
      }
    },

    async updateUser(user) {
      try {
        const { id, ...userData } = user;
        const client = await (clientPromiseOverride || clientPromise);
        const db = client.db("inboxflow");
        const result = await db.collection<AdapterUser>(COLLECTIONS.users).findOneAndUpdate(
          { _id: new ObjectId(id) },
          { $set: { ...userData, updatedAt: new Date() } },
          { returnDocument: "after" }
        );
        
        if (!result.value) return null;
        const { _id, ...rest } = result.value;
        return {
          id: _id.toString(),
          ...rest,
        };
      } catch (error) {
        console.error("updateUser error:", error);
        throw error;
      }
    },

    async linkAccount(accountData) {
      try {
        await ensureIndexes();
        const client = await (clientPromiseOverride || clientPromise);
        const db = client.db("inboxflow");
        const result = await db.collection<AdapterAccount>(COLLECTIONS.accounts).insertOne({
          ...accountData,
          _id: new ObjectId(),
          userId: new ObjectId(accountData.userId),
        });
        return {
          ...accountData,
          id: result.insertedId.toString(),
        };
      } catch (error) {
        console.error("linkAccount error:", error);
        throw error;
      }
    },

    async unlinkAccount({ providerAccountId, provider }) {
      try {
        const client = await (clientPromiseOverride || clientPromise);
        const db = client.db("inboxflow");
        await db.collection<AdapterAccount>(COLLECTIONS.accounts).deleteOne({
          providerAccountId,
          provider,
        });
      } catch (error) {
        console.error("unlinkAccount error:", error);
        throw error;
      }
    },

    async createSession(sessionData) {
      try {
        await ensureIndexes();
        const client = await (clientPromiseOverride || clientPromise);
        const db = client.db("inboxflow");
        const result = await db.collection<AdapterSession>(COLLECTIONS.sessions).insertOne({
          ...sessionData,
          _id: new ObjectId(),
          userId: new ObjectId(sessionData.userId),
          expires: new Date(sessionData.expires as string),
        });
        return {
          ...sessionData,
          id: result.insertedId.toString(),
        };
      } catch (error) {
        console.error("createSession error:", error);
        throw error;
      }
    },

    async getSessionAndUser(sessionToken) {
      try {
        const client = await (clientPromiseOverride || clientPromise);
        const db = client.db("inboxflow");
        
        const session = await db.collection<AdapterSession>(COLLECTIONS.sessions).findOne({
          sessionToken,
        });
        
        if (!session) return null;
        
        const user = await db.collection<AdapterUser>(COLLECTIONS.users).findOne({
          _id: new ObjectId(session.userId),
        });
        
        if (!user) return null;
        
        const { _id: userId, ...userRest } = user;
        const { _id: sessionId, ...sessionRest } = session;
        
        return {
          session: {
            id: sessionId!.toString(),
            userId: session.userId.toString(),
            ...sessionRest,
          },
          user: {
            id: userId!.toString(),
            ...userRest,
          },
        };
      } catch (error) {
        console.error("getSessionAndUser error:", error);
        return null;
      }
    },

    async updateSession({ sessionToken, expires }) {
      try {
        const client = await (clientPromiseOverride || clientPromise);
        const db = client.db("inboxflow");
        const result = await db.collection<AdapterSession>(COLLECTIONS.sessions).updateOne(
          { sessionToken },
          { $set: { expires: new Date(expires) } }
        );
        return result.modifiedCount === 1;
      } catch (error) {
        console.error("updateSession error:", error);
        return false;
      }
    },

    async deleteSession(sessionToken) {
      try {
        const client = await (clientPromiseOverride || clientPromise);
        const db = client.db("inboxflow");
        const result = await db.collection<AdapterSession>(COLLECTIONS.sessions).deleteOne({
          sessionToken,
        });
        return result.deletedCount === 1;
      } catch (error) {
        console.error("deleteSession error:", error);
        return false;
      }
    },

    async createVerificationToken(verificationToken) {
      try {
        await ensureIndexes();
        const client = await (clientPromiseOverride || clientPromise);
        const db = client.db("inboxflow");
        const result = await db.collection<VerificationToken>(COLLECTIONS.verificationTokens).insertOne({
          ...verificationToken,
          _id: new ObjectId(),
        });
        return {
          id: result.insertedId.toString(),
          ...verificationToken,
        };
      } catch (error) {
        console.error("createVerificationToken error:", error);
        throw error;
      }
    },

    async useVerificationToken({ identifier, token }) {
      try {
        const client = await (clientPromiseOverride || clientPromise);
        const db = client.db("inboxflow");
        const result = await db.collection<VerificationToken>(COLLECTIONS.verificationTokens).findOneAndDelete({
          identifier,
          token,
        });
        if (!result.value) return null;
        const { _id, ...rest } = result.value;
        return {
          id: _id!.toString(),
          ...rest,
        };
      } catch (error) {
        console.error("useVerificationToken error:", error);
        return null;
      }
    },

    async deleteUser(userId) {
      try {
        const client = await (clientPromiseOverride || clientPromise);
        const db = client.db("inboxflow");
        const objectId = new ObjectId(userId);
        
        // Delete cascade
        await db.collection<AdapterSession>(COLLECTIONS.sessions).deleteMany({ userId: objectId });
        await db.collection<AdapterAccount>(COLLECTIONS.accounts).deleteMany({ userId: objectId });
        await db.collection<AdapterUser>(COLLECTIONS.users).deleteOne({ _id: objectId });
        
        return true;
      } catch (error) {
        console.error("deleteUser error:", error);
        return false;
      }
    },
  } satisfies Adapter;
}
