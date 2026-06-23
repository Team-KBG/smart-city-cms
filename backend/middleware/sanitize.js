const sanitizeHtml = require('sanitize-html');

const sanitize = (obj) => {
  if (obj instanceof Object) {
    for (var key in obj) {
      if (key.startsWith('$')) {
        delete obj[key];
      } else {
        if (typeof obj[key] === 'string') {
          obj[key] = sanitizeHtml(obj[key], {
            allowedTags: [],
            allowedAttributes: {},
          });
        } else {
          sanitize(obj[key]);
        }
      }
    }
  }
  return obj;
};

const sanitizeInput = (req, res, next) => {
  if (req.body) {
    sanitize(req.body);
  }
  if (req.query) {
    sanitize(req.query);
  }
  if (req.params) {
    sanitize(req.params);
  }
  next();
};

module.exports = { sanitizeInput };
