const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const bcrypt = require('bcrypt');
const db = require('./database');
const { isTokenBlacklisted } = require('../utils/fakeRedisBlackListToken');

// Local Strategy for username/password login
passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
    },
    async (email, password, done) => {
      try {
        // Find user by email
        const user = await db('users')
          .where({ email })
          .first();

        // User not found
        if (!user) {
          return done(null, false, { message: 'Incorrect email.' });
        }

        // Check password
        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        if (!isValidPassword) {
          return done(null, false, { message: 'Incorrect password.' });
        }

        // Remove password_hash from user object
        const { password_hash, ...userWithoutPassword } = user;
        return done(null, userWithoutPassword);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// JWT Strategy for token authentication
passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
      passReqToCallback: true,
    },
    async (req, jwtPayload, done) => {
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.split(" ")[1];
      if (isTokenBlacklisted(token)) {
        return done(null, false, { message: 'Token is invalid' });
      }

      try {
        // Find user by ID from JWT payload
        const user = await db('users')
          .where({ id: jwtPayload.id })
          .first();

        if (!user) {
          return done(null, false);
        }

        // Remove password_hash from user object
        const { password_hash, ...userWithoutPassword } = user;
        return done(null, userWithoutPassword);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// Middleware for requiring authentication
const requireAuth = passport.authenticate('jwt', { session: false });

// Middleware for requiring organization membership
const requireOrgMembership = async (req, res, next) => {
  try {
    const user = req.user;
    const { organization_id } = req.params;

    const membership = await db('users')
      .where({
        id: user.id,
        organization_id,
      })
      .first();

    if (!membership) {
      return res.status(403).json({
        error: 'You do not have access to this organization',
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};

// Middleware for requiring project membership
const requireProjectMembership = async (req, res, next) => {
  try {
    const user = req.user;
    const { project_id } = req.params;

    const project = await db('projects')
      .where('id', project_id)
      .first();

    if (!project) {
      return res.status(404).json({
        error: 'Project not found',
      });
    }

    // Check if user belongs to the organization that owns the project
    const membership = await db('users')
      .where({
        id: user.id,
        organization_id: project.organization_id,
      })
      .first();

    if (!membership) {
      return res.status(403).json({
        error: 'You do not have access to this project',
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  passport,
  requireAuth,
  requireOrgMembership,
  requireProjectMembership,
};