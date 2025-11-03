const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

async function insertOrUpdateAdmin() {
  const uri = process.env.MONGODB_URI || 'mongodb+srv://sagarpatil062002_db_user:DIymNxxF7WS0UYjW@mastergurukulam.orcxtev.mongodb.net/?retryWrites=true&w=majority&appName=mastergurukulam';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('mastergurukulam');
    const collection = db.collection('admin_users');

    const email = 'sagarpatil062002@gmail.com';
    const hashedPassword = await bcrypt.hash('123456', 12);

    // Check if user already exists
    const existingUser = await collection.findOne({ email });

    if (existingUser) {
      // Update the existing user
      await collection.updateOne(
        { email },
        {
          $set: {
            password: hashedPassword,
            active: true,
            updatedAt: new Date()
          }
        }
      );
      console.log('Admin user updated with ID:', existingUser._id);
    } else {
      // Insert new user
      const adminUser = {
        name: 'Admin User',
        email,
        password: hashedPassword,
        role: 'super_admin',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await collection.insertOne(adminUser);
      console.log('Admin user inserted with ID:', result.insertedId);
    }
  } catch (error) {
    console.error('Error inserting/updating admin user:', error);
  } finally {
    await client.close();
  }
}

insertOrUpdateAdmin();