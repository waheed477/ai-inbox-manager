import { ObjectId } from 'mongodb';
import { getDb } from './mongodb';

export interface UserTokens {
  accessToken?: string;
  refreshToken?: string;
  tokenExpiry?: Date | null;
}

export async function getUserById(id: string) {
  try {
    const db = await getDb();
    const user = await db.collection('users').findOne({ _id: new ObjectId(id) });
    if (!user) return null;
    return {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      image: user.image,
      emailVerified: user.emailVerified,
      accessToken: user.accessToken,
      refreshToken: user.refreshToken,
      tokenExpiry: user.tokenExpiry,
    };
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    return null;
  }
}

export async function upsertUser(id: string, data: Partial<UserTokens> & { email: string; name?: string; image?: string; emailVerified?: Date | null }) {
  try {
    const db = await getDb();
    const updateData: any = {
      ...data,
      updatedAt: new Date(),
    };
    if (data.tokenExpiry && typeof data.tokenExpiry === 'number') {
      updateData.tokenExpiry = new Date(data.tokenExpiry);
    }
    const result = await db.collection('users').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { 
        $set: updateData,
        $setOnInsert: { createdAt: new Date() }
      },
      { upsert: true, returnDocument: 'after' }
    );
    return {
      id: result._id!.toString(),
      ...result,
    };
  } catch (error) {
    console.error('Error upserting user:', error);
    throw error;
  }
}

export async function updateUserTokens(userId: string, tokens: UserTokens) {
  try {
    const updateData: any = {
      updatedAt: new Date(),
    };
    if (tokens.accessToken) updateData.accessToken = tokens.accessToken;
    if (tokens.refreshToken) updateData.refreshToken = tokens.refreshToken;
    if (tokens.tokenExpiry) updateData.tokenExpiry = new Date(tokens.tokenExpiry);
    
    const db = await getDb();
    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { $set: updateData }
    );
    return result.modifiedCount > 0;
  } catch (error) {
    console.error('Error updating user tokens:', error);
    return false;
  }
}
