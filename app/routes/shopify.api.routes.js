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

    // Upload Pic
    app.post('/uploadPic', upload.single('picture'), controller.uploadPic);

    // Get picture
    app.get('/picture/:picture', controller.getPicture);
    // Get pictures
    // app.get('/pictures',controller.getPictures);


    app.get('/preview', controller.preview);

    app.get('/selectProduct/:id/:css', controller.selectProduct);
    app.get('/selectProductPage', controller.selectProductPage);


    app.get('/selectedBadgeID/:id', controller.selectedBadgeID);

    app.get('/getProductPriceRange/:p1/:p2', controller.getProductPriceRange);
    // app.get('/getProductPriceRange/:query', controller.getProductPriceRange);
    app.get('/getProductDateRange/:d1/:d2', controller.getProductDateRange);

    app.get('/getProductTitle/:t1', controller.getProductTitle);
    app.post('/ajaxtest',controller.ajaxtest);

    app.post('/withoutBadge',controller.withoutBadge);
    // app.post('/withoutBadge/:pids',controller.withoutBadge);





}
