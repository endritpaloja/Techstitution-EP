const express = require('express');
const app = express();
const ejs = require('ejs');
const path = require('path');
const mongo = require('mongodb').MongoClient;
const dbUrl = 'mongodb://localhost:27017/prokurimi';
const bodyParser = require('body-parser');
const ObjectId = require('mongodb').ObjectId;
const session = require('express-session');
const cookieParser = require('cookie-parser');
const moment = require('moment');

app.use(cookieParser());

app.use(session({
  key: 'user_sid',
  secret: '134as245jh4yg0@44kaj1@44242677',
  resave: false,
  saveUninitialized: false,
  cookie: {
      expires: 600000
  }
}));

app.use(function (req, res, next) {
  if (req.cookies.user_sid && !req.session.user) {
    res.clearCookie('user_sid');
  }
  next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));

// middleware function to check for logged-in users
var sessionChecker = (req, res, next) => {
  if (req.session.user && req.cookies.user_sid) {
    next();
  } else {
    res.redirect('/login');
  }
};

mongo.connect(dbUrl, function (err, client) {
  if (err) {
    console.log('error connecting to db');
  } else {
    console.log('connection to db was successful');
    kontratat = client.db('prokurimi').collection('kontratat');
    users = client.db('prokurimi').collection('users');
  }
})

var kontratat = {};
var users = {};

app.get('/', function (req, res) {
  res.render('index', { user: req.session.user });
});

app.get('/kontratat', function (req, res) {
  kontratat.find({}).toArray(function (err, docs) {
    if (err) {
      console.log(err);
      return;
    }

    res.render('kontratat', {
      docs: docs,
      user: req.session.user,
      moment: moment
    });
  });
});

app.get('/kontratat/add', sessionChecker, function (req, res) {
  kontratat.find({}).toArray(function (err, docs) {
    if (err) {
      console.log(err);
      return;
    }
    res.render('shto-kontratat', {
      docs: docs,
      user: req.session.user
    });
  });
});

app.post('/kontratat/add', function (req, res) {
  kontratat.insert({
    Nrrendor: req.body.Nrrendor,
    Lloji: req.body.Lloji,
    Aktiviteti: req.body.Aktiviteti,
    Inicimi: req.body.Inicimi,
    Publikimi: req.body.Publikimi,
    Nenshkrimi: req.body.Nenshkrimi,
    Afati1: req.body.Afati1,
    Afati2: req.body.Afati2,
    Preliminare: req.body.Preliminare,
    Cmimi: req.body.Cmimi,
    Totali: req.body.Totali,
    Kontraktuesi: req.body.Kontraktuesi,
    Statusi: req.body.Statusi
  }, function (err, result) {
    if (err) {
      console.log(err);
    }
    res.redirect('/kontratat');
  });
});

app.get('/kontratat/edit/:id', sessionChecker, function (req, res) {
  console.log(req.params.id);
  kontratat.findOne({
    _id: ObjectId(req.params.id)
  }, function (err, doc) {
    if (err) {
      console.log(err);
      return;
    }
    res.render('edit', {
      doc: doc,
      user: req.session.user
    });
  });
});

app.post('/kontratat/update/:id', sessionChecker, function (req, res) {
  kontratat.updateOne({
    _id: ObjectId(req.params.id)
  }, {
    $set: {
      Nrrendor: req.body.Nrrendor,
      Lloji: req.body.Lloji,
      Aktiviteti: req.body.Aktiviteti,
      Inicimi: req.body.Inicimi,
      Publikimi: req.body.Publikimi,
      Nenshkrimi: req.body.Nenshkrimi,
      Afati1: req.body.Afati1,
      Afati2: req.body.Afati2,
      Preliminare: req.body.Preliminare,
      Cmimi: req.body.Cmimi,
      Totali: req.body.Totali,
      Kontraktuesi: req.body.Kontraktuesi,
      Statusi: req.body.Statusi
    }
  }, function (err, doc) {
    if (err) {
      console.log(err);
    }
    res.redirect('/kontratat');
  });
});

app.get('/kontratat/delete/:id', sessionChecker, function (req, res) {
  kontratat.deleteOne({
    _id: ObjectId(req.params.id)
  }, function (err, doc) {
    if (err) {
      console.log(err);
    }
    res.redirect('/kontratat');
  });
});

app.get('/login', function (req, res) {
  res.render('login', { err: null });
});

app.post('/login', function (req, res) {
  users.findOne({ username: req.body.username, password: req.body.password }, function (err, user) {
    if (user) {
      req.session.user = user;
      res.redirect('/');
    } else {
      res.render('login', { err: 'Login deshtoj!' });
    }
  })
});

app.get('/register', function (req, res) {
  res.render('register', { user: req.session.user });
});

app.post('/register', function (req, res) {
  users.insert({
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    email: req.body.email,
    username: req.body.username,
    password: req.body.password
  }, function (err, result) {
    if (err) {
      console.log(err);
    }
    res.redirect('/');
  });
});

app.get('/logout', (req, res) => {
  if (req.session.user && req.cookies.user_sid) {
      res.clearCookie('user_sid');
      res.redirect('/');
  } else {
      res.redirect('/login');
  }
});

app.listen(3000, 'localhost', (err) => {
  if (err) {
    console.log('err');
  } else {
    console.log('server started listening');
  }
});

app.use(express.static('public'));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
