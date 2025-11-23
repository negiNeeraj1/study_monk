/**
 * Quick Admin User Creation Script
 * Run this after fixing your .env file
 */

require('dotenv').config();
const mongoose = require('mongoose');

// Admin User Schema (matching your existing model)
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  lastActive: { type: Date, default: Date.now },
  averageScore: { type: Number, default: 0 },
  totalQuizzes: { type: Number, default: 0 },
  studentsReached: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  avatar: { type: String, default: '' },
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

async function createAdminUser() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!mongoUri) {
      console.error('❌ No MongoDB URI found in .env file');
      return;
    }

    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('✅ Admin user already exists:', existingAdmin.email);
      console.log('👤 Admin Details:');
      console.log('   Email:', existingAdmin.email);
      console.log('   Name:', existingAdmin.name);
      console.log('   Role:', existingAdmin.role);
      return;
    }

    // Create new admin user
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@studymonk.com',
      password: 'admin123',
      role: 'admin',
      status: 'Active',
      isActive: true
    });

    await adminUser.save();
    console.log('🎉 Admin user created successfully!');
    console.log('📧 Email: admin@studymonk.com');
    console.log('🔑 Password: admin123');
    console.log('👤 Role: admin');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the script
createAdminUser();