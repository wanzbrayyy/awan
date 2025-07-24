import dbConnect from '../../lib/db';
import Message from '../../models/Message';
import User from '../../models/User';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'POST') {
    try {
      const { recipientUsername, text, link, image } = req.body;
      const { authorization } = req.headers;

      const recipient = await User.findOne({ username: recipientUsername });
      if (!recipient) {
        return res.status(404).json({ success: false, message: 'Recipient not found' });
      }

      let senderId = null;
      if (authorization && authorization.startsWith('Bearer ')) {
          const token = authorization.split(' ')[1];
          try {
              const decoded = jwt.verify(token, 'your-jwt-secret');
              senderId = decoded.userId;
          } catch (e) {
              // Invalid token, but we can still allow anonymous messages
          }
      }

      const message = new Message({
        sender: senderId,
        recipient: recipient._id,
        text,
        link,
        image,
      });

      await message.save();
      const populatedMessage = await Message.findById(message._id).populate('sender', 'username profilePicture');

      res.status(201).json({ success: true, data: populatedMessage });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  } else if (req.method === 'GET') {
      try {
        const { authorization } = req.headers;
        if (!authorization || !authorization.startsWith('Bearer ')) {
          return res.status(401).json({ message: 'Not authenticated' });
        }
        const token = authorization.split(' ')[1];
        const decoded = jwt.verify(token, 'your-jwt-secret');
        const userId = decoded.userId;

        const messages = await Message.find({ recipient: userId })
          .populate('sender', 'username profilePicture')
          .sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: messages });
      } catch (error) {
        res.status(401).json({ success: false, message: 'Invalid token' });
      }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
