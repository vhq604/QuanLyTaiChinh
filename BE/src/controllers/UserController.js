const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/UserModel.js');

const UserController = {
  register: async (req, res) => {
    try {
      const { username, email, password } = req.body;

      // Validate inputs
      if (!username || !email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng điền đầy đủ thông tin đăng ký.'
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Mật khẩu phải dài ít nhất 6 ký tự.'
        });
      }

      // Check existing username or email
      const existingUser = await UserModel.findByUsername(username);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Tên đăng nhập đã tồn tại.'
        });
      }

      const existingEmail = await UserModel.findByEmail(email);
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: 'Email đã được sử dụng.'
        });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create user
      const userId = await UserModel.create(username, email, hashedPassword);

      return res.status(201).json({
        success: true,
        data: {
          id: userId,
          username,
          email
        }
      });
    } catch (error) {
      console.error('Error in UserController.register:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi máy chủ trong quá trình đăng ký.'
      });
    }
  },

  login: async (req, res) => {
    try {
      const { username, password } = req.body; // username can be username or email

      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng điền tên đăng nhập/email và mật khẩu.'
        });
      }

      // Find user by username or email
      let user = await UserModel.findByUsername(username);
      if (!user) {
        user = await UserModel.findByEmail(username);
      }

      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'Tên đăng nhập hoặc mật khẩu không chính xác.'
        });
      }

      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: 'Tên đăng nhập hoặc mật khẩu không chính xác.'
        });
      }

      // Generate JWT
      const secret = process.env.JWT_SECRET || 'defaultjwtsecret';
      const token = jwt.sign(
        { id: user.id, username: user.username },
        secret,
        { expiresIn: '30d' }
      );

      return res.status(200).json({
        success: true,
        data: {
          token,
          user: {
            id: user.id,
            username: user.username,
            email: user.email
          }
        }
      });
    } catch (error) {
      console.error('Error in UserController.login:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi máy chủ trong quá trình đăng nhập.'
      });
    }
  },

  getMe: async (req, res) => {
    try {
      // req.user is set by auth middleware
      const user = await UserModel.findById(req.user.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy thông tin người dùng.'
        });
      }

      return res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('Error in UserController.getMe:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi máy chủ khi lấy thông tin người dùng.'
      });
    }
  }
};

module.exports = UserController;
