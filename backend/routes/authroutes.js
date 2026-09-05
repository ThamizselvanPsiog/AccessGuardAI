const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const db = require("../database/db");
const authenticateToken = require("../middleware/authmiddleware");

const router = express.Router();

const JWT_SECRET =
  process.env.JWT_SECRET ||
  "accessguardai-development-secret";


/*
 * ============================================
 * VALIDATION RULES
 * ============================================
 */

const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d])\S{8,}$/;


/*
 * ============================================
 * REGISTER
 * POST /api/auth/register
 * ============================================
 */

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all fields.",
      });
    }

    const trimmedName = name.trim();

    const normalizedEmail =
      email.trim().toLowerCase();

    /*
     * Validate name
     */

    if (!trimmedName) {
      return res.status(400).json({
        success: false,
        message: "Name cannot be empty.",
      });
    }

    /*
     * Validate email
     */

    if (!EMAIL_REGEX.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    /*
     * Validate password
     *
     * Requirements:
     * - Minimum 8 characters
     * - At least one uppercase letter
     * - At least one lowercase letter
     * - At least one number
     * - At least one special character
     * - No whitespace
     */

    if (!PASSWORD_REGEX.test(password)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 8 characters long and contain an uppercase letter, lowercase letter, number, and special character.",
      });
    }

    /*
     * Check whether email already exists
     */

    const existingUser = db
      .prepare(
        "SELECT id FROM users WHERE email = ?"
      )
      .get(normalizedEmail);

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message:
          "An account with this email already exists.",
      });
    }

    /*
     * Hash password
     */

    const passwordHash =
      await bcrypt.hash(password, 12);

    /*
     * Create user
     */

    const result = db
      .prepare(`
        INSERT INTO users (
          name,
          email,
          password_hash
        )
        VALUES (?, ?, ?)
      `)
      .run(
        trimmedName,
        normalizedEmail,
        passwordHash
      );

    return res.status(201).json({
      success: true,
      message: "Registration successful.",
      user: {
        id: result.lastInsertRowid,
        name: trimmedName,
        email: normalizedEmail,
      },
    });

  } catch (error) {
    console.error(
      "Registration error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to register user.",
    });
  }
});


/*
 * ============================================
 * LOGIN
 * POST /api/auth/login
 * ============================================
 */

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Please enter your email and password.",
      });
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    /*
     * Validate email format
     */

    if (!EMAIL_REGEX.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    const user = db
      .prepare(`
        SELECT
          id,
          name,
          email,
          password_hash
        FROM users
        WHERE email = ?
      `)
      .get(normalizedEmail);

    /*
     * Do not reveal whether the email
     * exists in the database.
     */

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const passwordMatches =
      await bcrypt.compare(
        password,
        user.password_hash
      );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
      },
      JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (error) {
    console.error(
      "Login error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to login.",
    });
  }
});


/*
 * ============================================
 * UPDATE PROFILE
 *
 * PUT /api/auth/profile
 *
 * Protected route
 * ============================================
 */

router.put(
  "/profile",
  authenticateToken,
  async (req, res) => {
    try {
      const { name, email } = req.body;

      /*
       * Validate input
       */

      if (!name || !email) {
        return res.status(400).json({
          success: false,
          message:
            "Name and email are required.",
        });
      }

      const trimmedName = name.trim();

      const normalizedEmail =
        email.trim().toLowerCase();

      if (!trimmedName || !normalizedEmail) {
        return res.status(400).json({
          success: false,
          message:
            "Name and email cannot be empty.",
        });
      }

      /*
       * Validate email format
       */

      if (!EMAIL_REGEX.test(normalizedEmail)) {
        return res.status(400).json({
          success: false,
          message:
            "Please enter a valid email address.",
        });
      }

      /*
       * Get currently authenticated user
       *
       * req.user.userId comes from JWT.
       */

      const currentUser = db
        .prepare(`
          SELECT
            id,
            name,
            email
          FROM users
          WHERE id = ?
        `)
        .get(req.user.userId);

      if (!currentUser) {
        return res.status(404).json({
          success: false,
          message: "User not found.",
        });
      }

      /*
       * Check whether another user already
       * owns the requested email.
       */

      const emailOwner = db
        .prepare(`
          SELECT id
          FROM users
          WHERE email = ?
          AND id != ?
        `)
        .get(
          normalizedEmail,
          req.user.userId
        );

      if (emailOwner) {
        return res.status(409).json({
          success: false,
          message:
            "That email address is already in use.",
        });
      }

      /*
       * Update database
       */

      db.prepare(`
        UPDATE users
        SET
          name = ?,
          email = ?
        WHERE id = ?
      `).run(
        trimmedName,
        normalizedEmail,
        req.user.userId
      );

      /*
       * Return updated user
       */

      const updatedUser = db
        .prepare(`
          SELECT
            id,
            name,
            email
          FROM users
          WHERE id = ?
        `)
        .get(req.user.userId);

      /*
       * IMPORTANT:
       *
       * Our existing JWT contains the old email.
       * Therefore create a new token with the
       * updated email.
       */

      const newToken = jwt.sign(
        {
          userId: updatedUser.id,
          email: updatedUser.email,
        },
        JWT_SECRET,
        {
          expiresIn: "7d",
        }
      );

      return res.status(200).json({
        success: true,
        message:
          "Profile updated successfully.",

        user: updatedUser,

        token: newToken,
      });

    } catch (error) {
      console.error(
        "Profile update error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to update profile.",
      });
    }
  }
);


/*
 * ============================================
 * CHANGE PASSWORD
 *
 * PUT /api/auth/password
 *
 * Protected route
 * ============================================
 */

router.put(
  "/password",
  authenticateToken,
  async (req, res) => {
    try {
      const {
        currentPassword,
        newPassword,
      } = req.body;

      /*
       * Validate input
       */

      if (
        !currentPassword ||
        !newPassword
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Current password and new password are required.",
        });
      }

      /*
       * Validate new password
       *
       * Same password policy as registration.
       */

      if (!PASSWORD_REGEX.test(newPassword)) {
        return res.status(400).json({
          success: false,
          message:
            "New password must be at least 8 characters long and contain an uppercase letter, lowercase letter, number, and special character.",
        });
      }

      /*
       * Get authenticated user
       */

      const user = db
        .prepare(`
          SELECT
            id,
            password_hash
          FROM users
          WHERE id = ?
        `)
        .get(req.user.userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found.",
        });
      }

      /*
       * Verify current password
       */

      const currentPasswordMatches =
        await bcrypt.compare(
          currentPassword,
          user.password_hash
        );

      if (!currentPasswordMatches) {
        return res.status(401).json({
          success: false,
          message:
            "Current password is incorrect.",
        });
      }

      /*
       * Prevent using the same password
       */

      const samePassword =
        await bcrypt.compare(
          newPassword,
          user.password_hash
        );

      if (samePassword) {
        return res.status(400).json({
          success: false,
          message:
            "New password must be different from your current password.",
        });
      }

      /*
       * Hash new password
       */

      const newPasswordHash =
        await bcrypt.hash(
          newPassword,
          12
        );

      /*
       * Update password
       */

      db.prepare(`
        UPDATE users
        SET password_hash = ?
        WHERE id = ?
      `).run(
        newPasswordHash,
        user.id
      );

      return res.status(200).json({
        success: true,
        message:
          "Password changed successfully.",
      });

    } catch (error) {
      console.error(
        "Password change error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to change password.",
      });
    }
  }
);


module.exports = router;