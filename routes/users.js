const express = require('express');

const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const { check, validationResult } = require('express-validator');

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

router.get('/login', (req, res) => res.render('login'));
router.get('/register', (req, res) => res.render('register'));

router.post('/register', check('email', 'Your email is not valid').isEmail(), (req, res) => {
  const { name, email, password, password2 } = req.body;

  const errors = [];

  const emailValidation = validationResult(req);

  if (!name || !email || !password || !password2) {
    errors.push({ msg: ' Please fill in all the fields' });
  }
  if (!emailValidation.isEmpty()) {
    errors.push({ msg: emailValidation.errors[0].msg });
  }

  if (password !== password2) {
    errors.push({ msg: 'Passwords do not match' });
  }

  if (password.length < 1) {
    errors.push({ msg: 'Password length should be atleast 6 characters' });
  }

  if (errors.length > 0) {
    res.render('register', {
      errors,
      name,
      email,
      password,
      password2,
    });
  } else {
    console.log(email);
    prisma.userTable
      .findUnique({
        where: { email },
      })
      .then((user) => {
        if (user) {
          errors.push({ msg: 'Email is already registerd' });
          res.render('register', {
            errors,
            name,
            email,
            password,
            password2,
          });
        } else {
          const newUser = {
            name,
            email,
            password,
          };
          bcrypt.genSalt(10, (err, salt) =>
            bcrypt.hash(newUser.password, salt, (err, hash) => {
              if (err) throw err;

              newUser.password = hash;

              prisma.userTable
                .create({
                  data: newUser,
                })
                .then((createdData) => {
                  req.flash('success_msg', ' You are now Registered and can login');
                  res.redirect('/users/login');
                })
                .catch((err) => console.log(err));
            })
          );
        }
      })
      .catch((e) => {
        throw e;
      })
      .finally(async () => {
        await prisma.$disconnect();
      });
  }
});

// login Handle
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/article/userArticles',
    failureRedirect: '/users/login',
    failureFlash: true,
  })(req, res, next);
});

// Logout handle
router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

module.exports = router;
