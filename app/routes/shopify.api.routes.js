module.exports = (app) => {
    const controller = require('../controllers/shopify.api.controller.js');

    console.log('Entered Shopify Route');

    // Install app
    app.get('/shopify', controller.install);

    // Auth
    app.get('/shopify/callback', controller.auth);

    // Product Page --temp
    app.get('/product', controller.productPage);

    // Copy Shopify DB to our DB
    app.get('/copyDB', controller.copyDB);

    // Create Webhooks
    app.get('/createWebhooks', controller.createWebhooks);

    // APIs to be triggered by webhook 
    // Delete product from our DB when triggered by webhook
    app.post('/deleteProduct', controller.deleteProduct);

    // Update product from our DB when triggered by webhook
    app.post('/updateProduct', controller.updateProduct);

    // Create product in our DB when triggered by webhook
    app.post('/createProduct', controller.createProduct);

    //Read product in our DB
    app.get('/getProduct/:id', controller.getProduct);

    const multer = require('multer')
    const upload = multer({ limits: { fileSize: 2000000 }, dest: '/uploads/' })

    // Get picture
    app.get('/picture/:picture', controller.getPicture);
    // Get pictures
    // app.get('/pictures',controller.getPictures);

    app.get('/getIDS', controller.getIDS);
    app.get('/getUserIDS', controller.getUserIDS);
    app.get('/preview', controller.preview);

    app.get('/selectProduct/:id/:css', controller.selectProduct);
    app.get('/selectProductPage', controller.selectProductPage);


    app.get('/selectedBadgeID/:id', controller.selectedBadgeID);

    app.get('/getProductPriceRange/:p1/:p2/:pr', controller.getProductPriceRange);
    // app.get('/getProductPriceRange/:query', controller.getProductPriceRange);
    app.get('/getProductDateRange/:d1/:d2/:dr', controller.getProductDateRange);

    app.get('/getProductTitle/:t1/:tr', controller.getProductTitle);
    app.post('/publishBadges', controller.publishBadges);

    // upload pic using uploader
    app.post('/api/upload', upload.single('photo'), controller.upload);
    // app.get('/api', controller.api )

}
