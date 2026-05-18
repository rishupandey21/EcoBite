const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const sendEmail = require("../utils/emailService");

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.account_type,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
};

// Register User
exports.registerUser = async (req, res) => {
  try {
    const {
      account_type,
      name,
      email,
      password,
      phoneNumber,
      address,
      latitude,
      longitude,
    } = req.body;

    // Basic validation
    if (!account_type || !name || !email || !password) {
      return res.status(400).json({
        message: "Account type, name, email and password are required",
      });
    }

    // Allow only valid roles
    const allowedRoles = ["restaurant", "ngo", "volunteer", "admin"];

    if (!allowedRoles.includes(account_type)) {
      return res.status(400).json({
        message: "Invalid account type",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already registered",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    /*
      Verification rule:
      - Volunteers can be verified by default.
      - Restaurants and NGOs should be verified by admin later.
      - Admin should normally be created manually/development only.
    */
    const isVerified = account_type === "volunteer" || account_type === "admin";

    // Create user
    const newUser = await User.create({
      account_type,
      name,
      email,
      password: hashedPassword,
      phoneNumber,
      address,
      latitude,
      longitude,
      isVerified,
      isSuspended: false,
    });


    await sendEmail({
      to: newUser.email,
      subject: "Welcome to EcoBite",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Welcome to EcoBite, ${newUser.name}!</h2>

          <p>Your EcoBite account has been created successfully.</p>

          <h3>Account Details</h3>
          <p><strong>Name:</strong> ${newUser.name}</p>
          <p><strong>Email:</strong> ${newUser.email}</p>
          <p><strong>Account Type:</strong> ${newUser.account_type}</p>

          ${
            newUser.account_type === "restaurant" || newUser.account_type === "ngo"
              ? `<p>Your account may need admin verification before you can use all features.</p>`
              : `<p>You can now login and start using EcoBite.</p>`
          }

          <p>Thank you for joining the movement to reduce food waste.</p>

          <p style="color: #16a34a; font-weight: bold;">EcoBite Notifications</p>
        </div>
      `,
    });

    return res.status(201).json({
      message: "Registration successful",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.account_type,
        isVerified: newUser.isVerified,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};

// Login User
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    // Find user
    const user = await User.findOne({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    // Block suspended user
    if (user.isSuspended) {
      return res.status(403).json({
        message: "Your account has been suspended. Please contact admin.",
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    // Create JWT token
    const token = generateToken(user);

    return res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        role: user.account_type,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        address: user.address,
        latitude: user.latitude,
        longitude: user.longitude,
        isVerified: user.isVerified,
        isSuspended: user.isSuspended,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};

// Get logged-in user profile
exports.getMe = async (req, res) => {
  try {
    return res.json({
      user: req.user,
    });
  } catch (error) {
    console.error("Get me error:", error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};