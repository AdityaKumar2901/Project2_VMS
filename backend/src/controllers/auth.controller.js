const bcrypt = require('bcryptjs');
const { dbRun, dbGet, dbAll } = require('../config/db');
const { generateTokenPair, verifyRefreshToken, hashToken } = require('../utils/jwt');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Register new user
 * POST /api/auth/register
 */
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role = 'customer' } = req.body;

  // Check if user already exists
  const existing = await dbGet(
    'SELECT id FROM users WHERE email = ?',
    [email]
  );

  if (existing) {
    return res.status(409).json({
      success: false,
      message: 'Email already registered'
    });
  }

  // Hash password
  const password_hash = await bcrypt.hash(password, 10);

  // Insert user
  const result = await dbRun(
    'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
    [name, email, password_hash, role]
  );

  const userId = result.lastID;

  // If vendor, create vendor profile
  if (role === 'vendor') {
    await dbRun(
      'INSERT INTO vendor_profiles (user_id, shop_name, email) VALUES (?, ?, ?)',
      [userId, name, email]
    );
  }

  // Generate tokens
  const user = { id: userId, email, role, name };
  const { accessToken, refreshToken } = generateTokenPair(user);

  // Store refresh token in database
  const tokenHash = hashToken(refreshToken);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days
  
  await dbRun(
    'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)',
    [userId, tokenHash, expiresAt]
  );

  res.status(201).json({
    success: true,
    message: 'Registration successful',
    data: {
      user: { id: userId, name, email, role },
      accessToken,
      refreshToken
    }
  });
});

/**
 * Login user
 * POST /api/auth/login
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user
  const user = await dbGet(
    'SELECT id, name, email, password_hash, role FROM users WHERE email = ?',
    [email]
  );

  console.log('Login attempt for:', email);
  console.log('User found:', user ? 'Yes' : 'No');
  console.log('Password hash exists:', user?.password_hash ? 'Yes' : 'No');

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password_hash);

  if (!isPasswordValid) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }

  // Generate tokens
  const { accessToken, refreshToken } = generateTokenPair(user);

  // Store refresh token
  const tokenHash = hashToken(refreshToken);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  
  await dbRun(
    'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)',
    [user.id, tokenHash, expiresAt]
  );

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      accessToken,
      refreshToken
    }
  });
});

/**
 * Refresh access token
 * POST /api/auth/refresh
 */
const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({
      success: false,
      message: 'Refresh token required'
    });
  }

  // Verify refresh token
  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired refresh token'
    });
  }

  // Check if token exists and is not revoked
  const tokenHash = hashToken(refreshToken);
  const tokens = await dbAll(
    'SELECT * FROM refresh_tokens WHERE token_hash = ? AND revoked = FALSE AND expires_at > NOW()',
    [tokenHash]
  );

  if (!tokens) {
    return res.status(401).json({
      success: false,
      message: 'Refresh token invalid or revoked'
    });
  }

  // Get user
  const users = await dbAll(
    'SELECT id, name, email, role FROM users WHERE id = ?',
    [decoded.id]
  );

  if (!users) {
    return res.status(401).json({
      success: false,
      message: 'User not found'
    });
  }

  const user = users;

  // Generate new token pair
  const { accessToken, refreshToken: newRefreshToken } = generateTokenPair(user);

  // Revoke old refresh token
  await dbRun(
    'UPDATE refresh_tokens SET revoked = TRUE WHERE token_hash = ?',
    [tokenHash]
  );

  // Store new refresh token
  const newTokenHash = hashToken(newRefreshToken);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  
  await dbRun(
    'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)',
    [user.id, newTokenHash, expiresAt]
  );

  res.json({
    success: true,
    message: 'Token refreshed successfully',
    data: {
      accessToken,
      refreshToken: newRefreshToken
    }
  });
});

/**
 * Logout user
 * POST /api/auth/logout
 */
const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (refreshToken) {
    const tokenHash = hashToken(refreshToken);
    await dbRun(
      'UPDATE refresh_tokens SET revoked = 1 WHERE token_hash = ?',
      [tokenHash]
    );
  }

  res.json({
    success: true,
    message: 'Logout successful'
  });
});

/**
 * Get current user
 * GET /api/auth/me
 */
const getMe = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Get user with vendor profile if applicable
  let query = `
    SELECT u.id, u.name, u.email, u.role, u.created_at,
           v.id as vendor_id, v.shop_name, v.verified as vendor_verified
    FROM users u
    LEFT JOIN vendor_profiles v ON u.id = v.user_id
    WHERE u.id = ?
  `;

  const users = await dbAll(query, [userId]);

  if (!users) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  const user = users;

  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        created_at: user.created_at,
        ...(user.vendor_id && {
          vendor: {
            id: user.vendor_id,
            shop_name: user.shop_name,
            verified: user.vendor_verified
          }
        })
      }
    }
  });
});

module.exports = {
  register,
  login,
  refresh,
  logout,
  getMe
};
