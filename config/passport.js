const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');

// Prisma imports
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

module.exports = function (passport) {
  passport.use(
    new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
      // Check  user
      console.log(email);
      prisma.userTable
        .findUnique({
          where: { email },
        })
        .then((user) => {
          if (!user) {
            return done(null, false, { message: ' That email is not registered' });
          }

          // Match the Password
          bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) throw err;

            if (isMatch) {
              return done(null, user);
            }
            return done(null, false, { message: ' Incorrect Password ' });
          });
        })
        .catch((err) => {
          throw err;
        })
        .finally(async () => {
          await prisma.$disconnect();
        });
    })
  );

  passport.serializeUser(function (user, done) {
    done(null, user);
  });

  passport.deserializeUser(function (user, done) {
    done(null, user);
  });
};
