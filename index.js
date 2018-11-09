const express = require('express');
const app = express();
var path = require('path');

var cors = require('cors');
app.use(cors());

const bodyparser = require('body-parser');
app.use(bodyparser.json());

app.get('/', (req, res) => {

  
  res.send('Hello World! from TRICON BADGER');
});

require('./app/routes/shopify.api.routes.js')(app);
// require('./app/routes/custom.api.routes.js')(app);

app.listen(3000, () => {
    console.log('App listening on port 3000!');
});

app.set('view engine','ejs');
//app.engine('html',  require('ejs').renderFile)

app.use('/static', express.static('public'));
app.use('/angular', express.static('client'));
app.use('/images', express.static('images')); 
app.use('/Badges', express.static('Badges')); 

app.use(express.static(path.join(__dirname,'client')))

app.get('/modal_content', function(req, res) {
  res.render('modal_content', {
    title: 'Embedded App Modal'
  });
})

// TODO: change the location to store the token, use redis or any other DB. or use session.
// 172.16.18.189:3000/shopify?shop=triconbadger.myshopify.com
// {your ngrok forwarding address}/shopify?shop=your-development-shop.myshopify.com
// https://3617ee8d.ngrok.io/shopify?shop=tricon-dev-store.myshopify.com