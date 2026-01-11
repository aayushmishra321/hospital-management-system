# MongoDB Atlas Setup for Production

## Quick Setup Steps:

1. **Go to MongoDB Atlas**: https://cloud.mongodb.com
2. **Create Free Account** (if you don't have one)
3. **Create New Cluster** (Free M0 tier)
4. **Create Database User**:
   - Username: `hospital_admin`
   - Password: Generate strong password
5. **Whitelist IP Addresses**:
   - Add `0.0.0.0/0` (allow from anywhere) for now
6. **Get Connection String**:
   - Click "Connect" → "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database password

## Example Connection String:
```
mongodb+srv://hospital_admin:<password>@cluster0.xxxxx.mongodb.net/hospital_db?retryWrites=true&w=majority
```

## Update Render Environment Variables:
1. Go to your Render backend dashboard
2. Environment → Add Variable:
   - Name: `MONGO_URI`
   - Value: `mongodb+srv://hospital_admin:<password>@cluster0.xxxxx.mongodb.net/hospital_db?retryWrites=true&w=majority`
3. Redeploy your backend service