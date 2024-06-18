const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  userType: { 
    type: String, 
    required: true, 
    enum: ['admin', 'learner', 'expert'],
    default: 'learner' 
  },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  bio: { type: String },
  dob: { type: Date },
  phoneNumber: { type: String, required: true },
  state: { type: String },
  country: { type: String, required: true },
  city: { type: String, required: true },
  track: { type: [String] },
  skills: { type: [String] },
  isVerified: {
    type: Boolean,
    default: false
  },
  oldPasswords: { type: [String], default: [] }
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } });

UserSchema.pre('save', async function (next) {
  const user = this;

  if (user.isModified('password')) {
    // If the password has been modified, add the old password to oldPasswords
    if (user.isNew) {
      // For new users, don't push the initial password into oldPasswords
      user.password = await bcrypt.hash(user.password, 10);
    } else {
      // user.oldPasswords.push(user.password);
      user.password = await bcrypt.hash(user.password, 10);
    }
  }

  // Remove confirmPassword field before saving, if it exists
  if (this.confirmPassword) {
    delete this.confirmPassword;
  }
  
  next();
});

UserSchema.methods.isValidPassword = async function (password) {
  try {
    return await bcrypt.compare(password, this.password);
  } catch (error) {
    throw new Error(error);
  }
};

const UserModel = mongoose.model('users', UserSchema);

module.exports = UserModel;
