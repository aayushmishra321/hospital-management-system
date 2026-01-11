# 🌐 Cloud Deployment with Local Database

## ⚠️ Important Considerations

Deploying to cloud while keeping a local database has limitations:
- Cloud services can't directly access your local MongoDB
- Your local machine must be always online
- Security and reliability concerns
- Network latency issues

## 🔧 Solution: Use ngrok Tunnel

### Step 1: Install and Setup ngrok

```bash
# Install ngrok
npm install -g ngrok

# Sign up at https://ngrok.com and get auth token
ngrok authtoken YOUR_AUTH_TOKEN
```

### Step 2: Expose Local MongoDB

```bash
# Expose MongoDB port to internet
ngrok tcp 27017
```

This will give you a public URL like: `tcp://0.tcp.ngrok.io:12345`

### Step 3: Update Environment Variables

For Render backend deployment, use:
```bash
MONGO_URI=mongodb://0.tcp.ngrok.io:12345/hospital_db
```

### Step 4: Deploy Frontend to Vercel

1. **Create Vercel Project**
   - Go to [Vercel](https://vercel.com)
   - Import your GitHub repository
   - Set root directory to `Frontend`

2. **Environment Variables**
   ```bash
   VITE_API_URL=https://your-backend.onrender.com/api
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51RQKzBFjky9wHK6tca2NxUZxKxrI2mpH9isbU23Kvi4jQfAA2x4cmrCpXD7tAhpbORyansnFbpjMH1tLDg3SCrbB00bEuXQUZp
   # ... other Firebase variables
   ```

3. **Deploy**
   - Click Deploy
   - Vercel will build and deploy automatically

### Step 5: Deploy Backend to Render

1. **Create Render Service**
   - Import GitHub repository
   - Set root directory to `backend`

2. **Environment Variables**
   ```bash
   NODE_ENV=production
   MONGO_URI=mongodb://0.tcp.ngrok.io:12345/hospital_db
   # ... other variables from your .env
   ```

## 🚨 Limitations of This Approach

1. **Reliability**: Your local machine must be always online
2. **Performance**: Network latency through tunnel
3. **Security**: Database exposed to internet
4. **Maintenance**: ngrok tunnel needs to be restarted periodically

## 💡 Better Alternatives

### Alternative 1: SQLite for Simple Deployment
- Use SQLite database file
- Deploy database file with backend
- Good for small applications

### Alternative 2: Render PostgreSQL
- Use Render's free PostgreSQL database
- Migrate your data from MongoDB
- More reliable for production

### Alternative 3: Railway or Heroku
- Deploy full stack to single platform
- Include database in same environment
- Easier management