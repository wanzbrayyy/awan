import dbConnect from '../../../lib/db';
import User from '../../../models/User';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  await dbConnect();

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(422).json({ message: 'Invalid input.' });
  }

  const existingUser = await User.findOne({ username });

  if (existingUser) {
    return res.status(422).json({ message: 'User already exists.' });
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const newUser = new User({
    username,
    password: hashedPassword,
  });

  const user = await newUser.save();

  res.status(201).json({ message: 'User created!', user });
}
