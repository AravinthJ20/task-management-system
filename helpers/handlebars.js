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
    formatDate(value) {
      if (!value) {
        return 'No date';
      }

      const date = new Date(value);
      if (Number.isNaN(date.getTime())) {
        return value;
      }

      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(date);
    },
    formatDateInput(value) {
      if (!value) {
        return '';
      }

      const date = new Date(value);
      if (Number.isNaN(date.getTime())) {
        return '';
      }

      return date.toISOString().split('T')[0];
    },
    statusClass(status) {
      const classes = {
        Todo: 'status-todo',
        'In Progress': 'status-progress',
        Completed: 'status-completed',
        Blocked: 'status-blocked',
      };

      return classes[status] || 'status-neutral';
    },
  },
});

module.exports = hbs;
