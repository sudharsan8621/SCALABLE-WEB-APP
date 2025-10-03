const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/scalable-webapp', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    
    // In development, we'll continue without MongoDB and use in-memory storage
    if (process.env.NODE_ENV !== 'production') {
      console.log('⚠️  Continuing without MongoDB in development mode');
      console.log('📝 Using in-memory storage for demo purposes');
      return;
    }
    
    // In production, exit the process
    process.exit(1);
  }
};

module.exports = connectDB;