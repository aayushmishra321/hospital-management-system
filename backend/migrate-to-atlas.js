const { MongoClient } = require('mongodb');

// Configuration - Your actual Atlas connection
const LOCAL_URI = 'mongodb://127.0.0.1:27017/hospital_db';
const ATLAS_URI = 'mongodb+srv://Hospital_System:Mishra%4012345@cluster0.i8tszch.mongodb.net/hospital_db?retryWrites=true&w=majority&appName=Cluster0';

async function migrateDatabase() {
    console.log('🚀 Starting database migration to Atlas...');
    
    let localClient, atlasClient;
    
    try {
        // Connect to local MongoDB
        console.log('📡 Connecting to local MongoDB...');
        localClient = new MongoClient(LOCAL_URI);
        await localClient.connect();
        const localDb = localClient.db('hospital_db');
        
        // Connect to Atlas
        console.log('☁️ Connecting to MongoDB Atlas...');
        atlasClient = new MongoClient(ATLAS_URI);
        await atlasClient.connect();
        const atlasDb = atlasClient.db('hospital_db');
        
        // Get all collections from local database
        const collections = await localDb.listCollections().toArray();
        console.log(`📋 Found ${collections.length} collections to migrate`);
        
        // Migrate each collection
        for (const collectionInfo of collections) {
            const collectionName = collectionInfo.name;
            console.log(`📦 Migrating collection: ${collectionName}`);
            
            // Get all documents from local collection
            const localCollection = localDb.collection(collectionName);
            const documents = await localCollection.find({}).toArray();
            
            if (documents.length > 0) {
                // Insert documents into Atlas collection
                const atlasCollection = atlasDb.collection(collectionName);
                
                // Clear existing data in Atlas (optional)
                await atlasCollection.deleteMany({});
                
                // Insert all documents
                await atlasCollection.insertMany(documents);
                console.log(`✅ Migrated ${documents.length} documents to ${collectionName}`);
            } else {
                console.log(`⚠️ Collection ${collectionName} is empty, skipping...`);
            }
        }
        
        console.log('🎉 Migration completed successfully!');
        
        // Verify migration
        console.log('\n📊 Verification:');
        for (const collectionInfo of collections) {
            const collectionName = collectionInfo.name;
            const localCount = await localDb.collection(collectionName).countDocuments();
            const atlasCount = await atlasDb.collection(collectionName).countDocuments();
            console.log(`${collectionName}: Local=${localCount}, Atlas=${atlasCount} ${localCount === atlasCount ? '✅' : '❌'}`);
        }
        
    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        // Close connections
        if (localClient) await localClient.close();
        if (atlasClient) await atlasClient.close();
    }
}

// Run migration
if (require.main === module) {
    migrateDatabase().catch(console.error);
}

module.exports = { migrateDatabase };