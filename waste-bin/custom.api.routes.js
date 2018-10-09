module.exports = (app) => {
    const controller = require('../controllers/custom.api.controller.js');

    console.log('Entered Custom Route');

    // Product Page --temp
    app.get('/product', controller.productPage);

    // Copy Shopify DB to our DB
    app.get('/copyDB', controller.copyDB);

    // APIs to be triggered by webhook 
    // Delete product from our DB when triggered by webhook
    app.delete('/deleteProduct/:id', controller.deleteProduct);

    // Update product from our DB when triggered by webhook
    app.put('/updateProduct/:id', controller.updateProduct);

    // Create product in our DB when triggered by webhook
    app.post('/createProduct', controller.createProduct);

    //Read product in our DB
    app.get('/getProduct/:id', controller.getProduct);

}