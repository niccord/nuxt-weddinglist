const express = require('express')
const { Router } = require('express')
const bodyParser = require('body-parser');

require('dotenv').config();

const invitesPassword = process.env.INVITESPASSWORD;

function findAuthCookie (cookieString) {
  const cookies = cookieString.split(';');
  const c = cookies.find(s => s.split('=')[0].trim() === 'weddingcookie');
  return c ? c.split('=') : undefined;
}

// Create express instance
const app = express();

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.use(function middleware (req, res, next) {
  if (req.originalUrl !== '/' && req.originalUrl !== '/api/checkpassword' && req.headers.connection !== 'close') {
    if (req && req.headers && req.headers.cookie) {
      try {
        const mic = findAuthCookie(req.headers.cookie);
        if (mic && mic[1].trim() === 'ThisIsTheWeddingCookie') {
          return next();
        }
      } catch (err) {
        console.log(err);
        return res.status(500);
      }
    }
    return res.status(401).send('Unauthorized');
  } else {
    return next();
  }
});

// Require API routes
const items = require('./routes/items')
const donations = require('./routes/donations')

const main = Router();
main.post('/checkPassword', function check (req, res, next) {
  if (req.body && req.body.params && req.body.params.pass && req.body.params.pass.toLowerCase() === invitesPassword) {
    return res.status(200).send('Authorized');
  }
  return res.status(401).send('Unauthorized');
});

// Import API Routes
app.use(main);
app.use(items);
app.use(donations);

// Export the server middleware
module.exports = {
  path: '/api',
  handler: app
}
