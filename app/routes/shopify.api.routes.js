module.exports = (app) => {
    const controller = require('../controllers/shopify.api.controller.js');

    console.log('Entered Shopify Route');

    // Install app
    app.get('/shopify', controller.install);

    // Auth
    app.get('/shopify/callback', controller.auth);
    app.get('/shopify/:appname', controller.App);

    // Product Page --temp
    app.get('/product', controller.productPage);

    // Copy Shopify DB to our DB
    app.get('/copyDB', controller.copyDB);
    app.get('/shopdet', controller.shopdet);

    // Create Webhooks
    app.get('/createWebhooks', controller.createWebhooks);

    // APIs to be triggered by webhook 
    // Delete product from our DB when triggered by webhook
    app.post('/deleteProduct/:shopname', controller.deleteProduct);

    // Update product from our DB when triggered by webhook
    app.post('/updateProduct/:shopname', controller.updateProduct);

    // Create product in our DB when triggered by webhook
    app.post('/createProduct/:shopname', controller.createProduct);
     app.get('/creatscript', controller.creatscript);


    //Read product in our DB
    app.get('/getProduct/:id', controller.getProduct);

    const multer = require('multer')
    // const upload = multer({ limits: { fileSize: 2000000 }, dest: '/uploads/' })

    var storage = multer.diskStorage({
        destination: function (req, file, cb) {
          cb(null, '/mih')
        },
        filename: function (req, file, cb) {
          cb(null, file.fieldname + '-' + Date.now())
        }
      })
       
      var upload = multer({ storage: storage })

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
    app.get('/getSrc/:pid', controller.getSrc);

    app.get('/getProductPriceRange/:p1/:p2/:pr', controller.getProductPriceRange);
    // app.get('/getProductPriceRange/:query', controller.getProductPriceRange);
    app.get('/getProductDateRange/:d1/:d2/:dr', controller.getProductDateRange);

    app.get('/getProductTitle/:t1/:tr', controller.getProductTitle);
    app.get('/getProductTag/:tg1/:tr', controller.getProductTag);
    app.post('/publishBadges', controller.publishBadges);
    app.post('/unpublishBadges', controller.unpublishBadges);

    // upload pic using uploader
    app.post('/api/upload', upload.single('photo'), controller.upload);
 
    // app.get('/api', controller.api )
    app.post('/deleteUserBadge/',controller.deleteBadge);
   
    app.get('/tags', controller.tags);
    app.get('/currency', controller.currency);

}
