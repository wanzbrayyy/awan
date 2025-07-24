import dbConnect from '../../../lib/db';
import User from '../../../models/User';

export default async function handler(req, res) {
  const {
    query: { username },
    method,
  } = req;

  await dbConnect();

  switch (method) {
    case 'GET':
      try {
        const user = await User.findOne({ username: new RegExp(`^${username}$`, 'i') }).select('-password');
        if (!user) {
          return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.status(200).json({ success: true, data: user });
      } catch (error) {
        res.status(400).json({ success: false, message: error.message });
      }
      break;
    default:
      res.setHeader('Allow', ['GET']);
      res.status(405).end(`Method ${method} Not Allowed`);
      break;
  }
}
