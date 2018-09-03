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

app.use('/static', express.static('public'));

// TODO: change the location to store the token, use redis or any other DB. or use session.
// localhost:3000/shopify?shop=triconbadger.myshopify.com