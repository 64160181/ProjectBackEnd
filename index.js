const express = require('express')
const ejs = require('ejs')
const mysql = require('mysql')
const bodyParser = require('body-parser')
const session = require('express-session')

const app = express()
const port = 3000
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(session({ secret: "secret" }))

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

// function
function isProductIncart(cart, id) {
  for (let i = 0; i < cart.length; i++) {
    if (cart[i].id === id) {
      return true;
    }
  }
  return false;
};

function calculateTotal(cart, req) {
  total = 0;
  for (let i = 0; i < cart.length; i++) {
    //if we're offering a discounted price
    if (cart[i].sale_price) {
      total = total + (cart[i].sale_price * cart[i].quantity);
    } else {
      total = total + (cart[i].price * cart[i].quantity);
    }
  }
  req.session.total = total;
  return total;
};

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
app.get('/about', (req, res) => { res.render('pages/about') });
app.get('/contact', (req, res) => { res.render('pages/contact') });
app.get('/brand', (req, res) => { res.render('pages/brand') });
app.get('/special', (req, res) => { res.render('pages/special') });

app.get('/cart', function (req, res) {

  var cart = req.session.cart;
  var total = req.session.total;

  res.render('pages/cart', { cart: cart, total: total });

});

app.get('/checkout', function (req, res) {
  var total = req.session.total;
  res.render('pages/checkout', { total: total });
});

app.get('/payment', function (req, res) {
  res.render('pages/payment');
});

app.post('/add_to_cart', function (req, res) {

  var id = req.body.id;
  var name = req.body.name;
  var price = req.body.price;
  var sale_price = req.body.sale_price;
  var quantity = req.body.quantity;
  var image = req.body.image;
  var product = { id: id, name: name, price: price, sale_price: sale_price, quantity: quantity, image: image };

  if (req, session.cart) {
    var cart = res.session.cart;
    if (!isProductIncart(cart, id)) {
      cart.push(product);
    }
  } else {
    req.session.cart = [product];
    var cart = req.session.cart;
  }

  //calculate total
  calculateTotal(cart, req);

  //return to cart page
  res.redirect('/cart')
});

app.post('/remove_product', function (req, res) {

  var id = req.body.id;
  var cart = req.session.cart;

  for (let i = 0; i < cart.length; i++) {
    if (cart[i].id === id) {
      cart.splice(cart.indexOf(i), 1);
    }
  }
  //recalculate total
  calculateTotal(cart, req);

  res.redirect('/cart');
});

app.post('/edit_product_qauntity', function (req, res) {
  var id = req.body.id;
  var quantity = req.body.quantity;
  var increase_btn = req.body.increase_product_quantity_btn;
  var decrease_btn = req.body.decrease_product_quantity_btn;
  var cart = req.session.cart;

  if(increase_btn){
    for(let i=0; i<cart.length; i++){
      if(cart[i].id === id){
        if(cart[i].quantity > 0){
          cart[i].quantity = parseInt(cart[i].quantity) + 1;
        }
      }
    }
  }

  if(decrease_btn){
    for(let i=0; i<cart.length; i++){
      if(cart[i].id === id){
        if(cart[i].quantity > 1){
          cart[i].quantity = parseInt(cart[i].quantity) - 1;
        }
      }
    }
  }
  calculateTotal(cart, req);
  res.redirect('/cart');
});

app.post('/place_order', function(req, res){
  var name = req.body.name;
  var email = req.body.email;
  var phone = req.body.phone;
  var city  = req.body.city;
  var address = req.body.address;
  var cost = req.session.total;
  var status = "pending"; 
  var date = new Date();
  var products_ids = "";

  var con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'project64160181',
  });

  var cart = req.session.cart;
  for(let i=0; i<cart.length; i++){
    products_ids = products_ids + "," + cart[i].id
  }

  con.connect((err)=>{
    if(err){
      console.log(err);
    }else{
      var query = "INSERT INTO orders(cost,name,email,status,city,address,phone,date,products_ids) VALUES ?";
      var values = [
        [cost,name,email,status,city,address,phone,date,products_ids]
      ];
      con.query(query, [values], function(err, result){

        res.redirect('/payment');
    });
    }
  })
});
// Start server
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
});