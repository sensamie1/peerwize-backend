const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  user_type: { 
    type: String, 
    required: true, 
    enum: ['admin', 'learner', 'expert'],
    default: 'learner' 
  },
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  bio: { type: String },
  dob: { type: Date },
  phone_number: { type: String, required: true },
  state: { type: String },
  country: { type: String, required: true },
  city: { type: String, required: true },
  track: { type: [String] },
  skills: { type: [String] },
  isVerified: {
    type: Boolean,
    default: false
  },
  old_passwords: { type: [String], default: [] }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

UserSchema.pre('save', async function (next) {
  const user = this;

  if (user.isModified('password')) {
    // If the password has been modified, add the old password to old_passwords
    if (user.isNew) {
      // For new users, don't push the initial password into old_passwords
      user.password = await bcrypt.hash(user.password, 10);
    } else {
      // user.old_passwords.push(user.password);
      user.password = await bcrypt.hash(user.password, 10);
    }
  }

  // Remove confirm_password field before saving, if it exists
  if (this.confirm_password) {
    delete this.confirm_password;
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
