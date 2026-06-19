const exphbs = require('express-handlebars');

const hbs = exphbs.create({
  defaultLayout: 'main',
  helpers: {
    ifEquals(a, b, options) {
      if (a && b && a.toString() === b.toString()) {
        return options.fn(this);
      }
      return options.inverse(this);
    },
  },
});

module.exports = hbs;
