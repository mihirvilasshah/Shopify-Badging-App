const express = require('express');
const app = express();

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

app.use('/static', express.static('public'));

app.get('/modal_content', function(req, res) {
  res.render('modal_content', {
    title: 'Embedded App Modal'
  });
})

// TODO: change the location to store the token, use redis or any other DB. or use session.
// localhost:3000/shopify?shop=triconbadger.myshopify.com
// {your ngrok forwarding address}/shopify?shop=your-development-shop.myshopify.com