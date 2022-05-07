const schema = require('../Schema/Schema')

module.exports.validateMovie = (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) {
    const msg = error.details.map(el => el.message).join(',')
    throw new errorHandler(msg, 400)
  } else {
    next();
  }

}

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {

    req.session.returnTo = req.originalUrl;
    req.flash('error', 'Please login first!')
    res.redirect('/login');
  };
  next();
}
