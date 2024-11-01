'use strict';
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');

const apiRoutes = require('./routes/api.js');
const fccTestingRoutes = require('./routes/fcctesting.js');
const runner = require('./test-runner');

const app = express();

// Configuración de Content Security Policy
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"],
    },
  })
);

app.use('/public', express.static(process.cwd() + '/public'));
app.use(cors({ origin: '*' })); // Solo para pruebas FCC
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Página de inicio (HTML estático)
app.route('/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
  });

// Rutas de prueba para FCC
fccTestingRoutes(app);

// Rutas de la API
apiRoutes(app);

// Middleware para manejar errores 404
app.use(function (req, res, next) {
  res.status(404).type('text').send('Not Found');
});

// Inicia el servidor y ejecuta las pruebas
const listener = app.listen(process.env.PORT || 3000, function () {
  console.log('Your app is listening on port ' + listener.address().port);
  if (process.env.NODE_ENV === 'test') {
    console.log('Running Tests...');
    setTimeout(function () {
      try {
        runner.run();
      } catch (e) {
        console.log('Tests are not valid:');
        console.error(e);
      }
    }, 3500);
  }
});

module.exports = app; // Para pruebas

