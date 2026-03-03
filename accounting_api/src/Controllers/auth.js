// authController.js

import jwt from 'jsonwebtoken';
import User from '../Models/User.js';
import MESSAGES from '../Utils/messages.js';

const authController = {
  login: async (req, res) => {
    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: MESSAGES.CONTROLLERS.AUTH.USER_NOT_FOUND });
      }

      // Placeholder for password validation logic
      if (password !== user.password) {
        return res.status(401).json({ message: MESSAGES.CONTROLLERS.AUTH.INVALID_CREDENTIALS });
      }

      // Generate JWT token with role and company information
      const token = jwt.sign(
        { id: user._id, role: user.role, companyId: user.companyId },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      res.json({ token, role: user.role, companyId: user.companyId });
    } catch (error) {
      res.status(500).json({ message: MESSAGES.CONTROLLERS.AUTH.SERVER_ERROR, error });
    }
  },

  register: async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
      const newUser = new User({ name, email, password, role });
      await newUser.save();
      res.status(201).json({ message: MESSAGES.CONTROLLERS.AUTH.REGISTER_SUCCESS });
    } catch (error) {
      res.status(500).json({ message: MESSAGES.CONTROLLERS.AUTH.SERVER_ERROR, error });
    }
  },
};

export default authController;