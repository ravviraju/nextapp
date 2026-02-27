import clientPromise from "../mongodb";
import bcrypt from "bcryptjs";

export async function createAdminUser(email, password) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const usersCollection = db.collection('users');

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = {
      email,
      password: hashedPassword,
      role: 'admin',
      createdAt: new Date(),
    };

    const result = await usersCollection.insertOne(user);
    return result.insertedId;
  } catch (error) {
    console.error('Error creating admin user:', error);
    throw error;
  }
}

export async function findUserByEmail(email) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const usersCollection = db.collection('users');

    const user = await usersCollection.findOne({ email });
    return user;
  } catch (error) {
    console.error('Error finding user:', error);
    throw error;
  }
}

export async function getAllUsers() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const usersCollection = db.collection("users");

    const users = await usersCollection
      .find(
        {},
        {
          projection: {
            password: 0,
          },
        }
      )
      .sort({ createdAt: -1 })
      .toArray();

    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
}

export async function verifyPassword(plainPassword, hashedPassword) {
  try {
    return await bcrypt.compare(plainPassword, hashedPassword);
  } catch (error) {
    console.error('Error verifying password:', error);
    throw error;
  }
}
