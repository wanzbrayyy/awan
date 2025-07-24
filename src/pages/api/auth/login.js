import dbConnect from '../../../lib/db';
import User from '../../../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'your-jwt-secret'; // It's better to use an environment variable for this

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  await dbConnect();

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(422).json({ message: 'Invalid input.' });
  }

  const user = await User.findOne({ username });

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials.' });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return res.status(401).json({ message: 'Invalid credentials.' });
  }

  const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });

  res.status(200).json({ token, user });
}
