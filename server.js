'use strict';
require('dotenv').config();
const express     = require('express');
const bodyParser  = require('body-parser');
const cors        = require('cors');

require("./DB-module");
const helmet = require("helmet");

const apiRoutes         = require('./api.js');
const fccTestingRoutes  = require('./fcctesting.js');
const runner            = require('./test-runner');

const app = express();

app.use('/public', express.static(process.cwd() + '/public'));

app.use(cors({ origin: '*' }));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(helmet({
  frameguard: { action: 'sameorigin' },
  referrerPolicy: { policy: 'same-origin' },
  dnsPrefetchControl: { allow: false },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'"],
      scriptSrc: ["'self'", 'trusted-cdn.com'],
    },
  },
}));

//Sample front-end
app.route('/b/:board/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/board.html');
  });
app.route('/b/:board/:threadid')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/thread.html');
  });

//Index page (static HTML)
app.route('/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/index.html');
  });

//For FCC testing purposes
fccTestingRoutes(app);

//Routing for API 
apiRoutes(app);

//404 Not Found Middleware
app.use(function(req, res, next) {
  res.status(404)
    .type('text')
    .send('Not Found');
});

//Start our server and tests!
app.listen(process.env.PORT || 3000, function () {
  console.log("Listening on port " + process.env.PORT);
  if (process.env.NODE_ENV === 'test' && require.main === module) {
    console.log('Running Tests...');
    setTimeout(function () {
      try {
        runner.run();
      } catch(e) {
        var error = e;
          console.log('Tests are not valid:');
          console.log(error);
      }
    }, 1500);
  }
});

module.exports = app; //for testing
