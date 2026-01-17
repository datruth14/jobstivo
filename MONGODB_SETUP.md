# MongoDB Setup Instructions for 14eterAI

## Environment Variables

Add the following to your `.env.local` file:

```bash
# MongoDB Connection String
MONGODB_URI=your_mongodb_connection_string_here

# Existing variables (keep these)
OPENAI_API_KEY=your_openai_key
RAPIDAPI_KEY=your_rapidapi_key
```

---

## Option 1: MongoDB Atlas (Cloud - Recommended)

### Step 1: Create a Free MongoDB Atlas Account
1. Go to [https://www.mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register)
2. Sign up for a free account

### Step 2: Create a Cluster
1. Click "Build a Database"
2. Choose the **FREE** tier (M0 Sandbox)
3. Select a cloud provider and region closest to you
4. Click "Create Cluster"

### Step 3: Create a Database User
1. Go to "Database Access" in the left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Set username and password (save these!)
5. Set privileges to "Read and write to any database"
6. Click "Add User"

### Step 4: Whitelist Your IP
1. Go to "Network Access" in the left sidebar
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (for development)
   - **Note**: For production, restrict to specific IPs
4. Click "Confirm"

### Step 5: Get Connection String
1. Go back to "Database" in the left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your database user password
6. Replace `<dbname>` with `14eterai` (or any name you prefer)

Example connection string:
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/14eterai?retryWrites=true&w=majority
```

### Step 6: Add to .env.local
```bash
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/14eterai?retryWrites=true&w=majority
```

---

## Option 2: Local MongoDB

### Step 1: Install MongoDB
**Ubuntu/Debian:**
```bash
sudo apt-get install mongodb
sudo systemctl start mongodb
```

**macOS:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Windows:**
Download from [https://www.mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)

### Step 2: Add to .env.local
```bash
MONGODB_URI=mongodb://localhost:27017/14eterai
```

---

## Verify Setup

After adding the `MONGODB_URI` to `.env.local`:

1. Restart your development server:
   ```bash
   # Stop the current server (Ctrl+C)
   npm run dev
   ```

2. Open your browser to `http://localhost:3000`

3. Check the terminal for the message:
   ```
   ✓ MongoDB connected successfully
   ```

4. The app should automatically create a default user with 500 coins

---

## Troubleshooting

**Error: "MONGODB_URI is not defined"**
- Make sure `.env.local` exists in the project root
- Restart the dev server after adding the variable

**Error: "MongoServerError: bad auth"**
- Check your username and password in the connection string
- Ensure the database user was created correctly

**Error: "Could not connect to any servers"**
- For Atlas: Check that your IP is whitelisted
- For local: Ensure MongoDB service is running

**Error: "connect ECONNREFUSED"**
- For local MongoDB: Start the MongoDB service
- Check if MongoDB is running on the correct port
