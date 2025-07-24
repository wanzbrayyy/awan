import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  requestTitle: {
    type: String,
    default: 'Send me anonymous messages!',
  },
  profilePicture: {
    type: String,
    default: function() {
      return `https://api.dicebear.com/7.x/bottts/svg?seed=${this.username}`
    },
  },
  plan: {
    type: String,
    default: 'free',
  },
  hitCount: {
    type: Number,
    default: 0,
  },
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
