const express = require('express') 
const ejs = require('ejs') 
const mysql = require('mysql')
const bodyParser = require('body-parser')

const app = express()
const port = 3000 
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: true }))

//config database
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'project64160181',
  });

// Connect to the MySQL database
connection.connect((error) => {
  if (error) {
  console.error('Error connecting to the database: ', error);
  } else {
  console.log('Connected to the database');
  }
  });

// Routes
app.get('/', (req, res) => {
  // Fetch products from the database
  connection.query('SELECT * FROM products', (error, results) => {
  if (error) {
  console.error('Error fetching products: ', error);
  res.status(500).send('Internal Server Error');
  } else {
  res.render('pages/index', { products: results });
  }
  });
  });
app.get('/about', (req, res) => {res.render('pages/about')});
app.get('/contact', (req, res) => {res.render('pages/contact')});
app.get('/brand', (req, res) => {res.render('pages/brand')});
app.get('/special', (req, res) => {res.render('pages/special')});

// Start server
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
});