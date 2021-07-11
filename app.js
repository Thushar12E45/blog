const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const upload = require('express-fileupload');
const { logger } = require('./util/winstonLogger.js');

const app = express();
const PORT = process.env.PORT || 8000;

require('./config/passport')(passport);

app.use(expressLayouts);
app.set('view engine', 'ejs');

// Bodyparser
app.use(express.urlencoded({ extended: false }));

// Express Session middleware
app.use(
  session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());
app.use(upload());
// Global vars
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

// Routes
try {
  app.use(express.static(`${__dirname}/public`));
  app.use('/', require('./routes/articleRoute.js'));
  app.use('/users', require('./routes/users.js'));

  app.listen(PORT, console.log(`Listening at port http://localhost:${PORT}`));
} catch (err) {
  console.log(err);
  // logger.error(err.stack);
}
