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
app.use(session({secret:"secret"}))

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
function isProductInCart(cart,id) {
  
  for(let i=0;i<cart.length;i++) {
    if(cart[i].id == id) {
      return true;
    }
  }

  return false;
}

function calculateTotal(cart,id) {
  total = 0;
  for(let i=0;i<cart.length;i++) {
    if (cart[i.sale_price]){
      total += cart[i].sale_price * cart[i].quantity;
    } else {
      total = cart[i].price * cart[i].quantity;
  }
  req.session.total = total;
  return total;
  }

}

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
app.get('/cart',function(req,res) {
  var cart = req.session.cart;
  var total = req.session.total;
  res.render('pages/cart',{cart:cart,total:total});
});

app.post('add_to_cart',function(req,res) {
  var id = req.body.id;
  var name = req.body.name;
  var price = req.body.price;
  var sale_price = req.body.sale_price;
  var quantity = req.body.quantity;
  var imgae = req.body.imgae;
  var products = {id:id,name:name,price:price,sale_price:sale_price,quantity:quantity,imgae:imgae};
  
  if(req.session.cart) {
    var cart = req.session.cart;

    if(!isProductInCart(cart,id)){
      cart.push(products);
    }
  } else {
    req.session.cart = [products];
    var cart = req.session.cart;
  }

  //calculate total
  calculateTotal(cart,req);

  //redirect to cart page
  res.redirect('/cart');
});

// Start server
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
});