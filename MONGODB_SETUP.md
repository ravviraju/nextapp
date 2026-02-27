# MongoDB Setup Guide

This guide will help you connect the admin login system to MongoDB.

## Prerequisites

1. MongoDB database (local or MongoDB Atlas)
2. MongoDB connection string

## Setup Steps

### 1. Create Environment Variables

Create a `.env.local` file in the root directory of your project:

```env
MONGODB_URI=your_mongodb_connection_string_here
```

**Examples:**
- **MongoDB Atlas**: `mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority`
- **Local MongoDB**: `mongodb://localhost:27017/nextapp`

### 2. Create Your First Admin User

You can create an admin user using one of these methods:

#### Method 1: Using the Script (Recommended)

```bash
node scripts/create-admin.js admin@example.com yourpassword
```

#### Method 2: Using MongoDB Compass or MongoDB Shell

Connect to your database and insert a user document:

```javascript
use your_database_name

db.users.insertOne({
  email: "admin@example.com",
  password: "$2a$10$hashed_password_here", // Use bcrypt to hash your password
  role: "admin",
  createdAt: new Date()
})
```

To hash a password, you can use an online bcrypt generator or run this in Node.js:

```javascript
const bcrypt = require('bcryptjs');
const hash = bcrypt.hashSync('yourpassword', 10);
console.log(hash);
```

### 3. Test the Login

1. Start your Next.js development server:
   ```bash
   npm run dev
   ```

2. Navigate to `/admin/login`
3. Enter the email and password you created
4. You should be redirected to the admin dashboard upon successful login

## Database Structure

The system uses a `users` collection with the following schema:

```javascript
{
  email: String (unique),
  password: String (bcrypt hashed),
  role: String (default: "admin"),
  createdAt: Date
}
```

## Security Notes

- Passwords are hashed using bcrypt with 10 salt rounds
- Never commit `.env.local` to version control
- Use strong passwords for admin accounts
- Consider implementing rate limiting for login attempts
- Consider adding JWT tokens for session management

## Troubleshooting

### Connection Error
- Verify your `MONGODB_URI` is correct
- Check if your MongoDB instance is running
- For MongoDB Atlas, ensure your IP is whitelisted

### Login Not Working
- Verify the user exists in the database
- Check that the password hash matches
- Ensure the user has `role: "admin"`

### Module Not Found
- Run `npm install` to ensure all dependencies are installed
- Check that `mongodb` and `bcryptjs` are in your `package.json`
