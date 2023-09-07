const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const app = express();
const fs = require('fs');

// Configuración de mongoose y conexión a la base de datos
mongoose.connect('mongodb://localhost:27017/car_app', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Definir el esquema del usuario
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
});

const User = mongoose.model('User', userSchema);

// Configuración de Express
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true,
  })
);

// Rutas
app.get('/', (req, res) => {
  res.redirect('/login');
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/formulario', (req, res) => {
  res.render('formulario');
});

app.get('/vehiculoform', (req, res) => {
  res.render('vehiculoform');
});


app.get('/logout', (req, res) => {
    req.session.user = {}
    res.redirect('/login');
  });

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    fs.readFile('users.json', (err, data) => {
      if (err) {
        console.error('Error al leer el archivo de usuarios:', err);
        return res.redirect('/login');
      }
  
      const users = JSON.parse(data);
      const user = users.find(u => u.username === username);
      if (user.password == password) {
        req.session.user = user;
        res.redirect('/inicio');
      } else {
        res.redirect('/login');
      }
    });
  });

  
app.get('/bot', (req, res) => {
  res.render('bot.ejs');   
})
app.get('/vehiculos', (req, res) => {
    if (req.session.user) {
      // Aquí obtienes los datos del usuario autenticado desde la sesión
      const user = req.session.user;
      fs.readFile('cars.json', (err, dataa) => {
        if (err) {
          return res.redirect('/inicio');
        } 
        const cars = JSON.parse(dataa);  
        res.render('vehiculos.ejs', { user: user,  cars: cars });    
      });
  
    } else {
      res.redirect('/login');
    }
  });

  app.get('/reservas', (req, res) => {
    if (req.session.user) {
      // Aquí obtienes los datos del usuario autenticado desde la sesión
      const user = req.session.user;
      fs.readFile('cars.json', (err, dataa) => {
        if (err) {
          return res.redirect('/inicio');
        } 
        const reservations = JSON.parse(dataa);  
        res.render('reservas.ejs', { user: user,  reservations: reservations });    
      });
    } else {
      res.redirect('/login');
    }
  });

  app.get('/inicio', async (req, res) => {
    if (req.session.user) {
      const user = req.session.user;
      res.render('inicio.ejs', { user: user});    
    } else {
      res.redirect('/login');
    }
  });

  app.get('/login', (req, res) => {
    res.render('ficheros');
  });

  app.get('/ficheros', (req, res) => {
    if (req.session.user && req.session.user.username.includes("ventas")) {
      // Aquí obtienes los datos del usuario autenticado desde la sesión
      const user = req.session.user;
      res.render('ficheros.ejs', { user: user}); // Asegúrate de pasar user y cars a la plantilla
    } else {
      res.redirect('/reservas');
      console.log("Solo los usuarios de ventas pueden acceder a este espacio")
    }
  });

app.listen(3000, () => {
  console.log('Servidor iniciado en http://localhost:3000');
});
