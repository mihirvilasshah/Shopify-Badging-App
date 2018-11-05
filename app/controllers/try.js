exports.unpublishBadges = (req, res) => {

    for (var i = 0; i < req.body.pid.length; i++) {
        for (var j = 0; j < req.body.pid[i].abid.length; j++) {

            MongoClient.connect(url, { useNewUrlParser: true })
                .then(function (err, db) {
                    if (err) throw err;

                    var dbo = db.db("shopifydbclone");
                    console.log("response result");

                    console.log(req.body.pid);


                    console.log(req.body.pid[i].abid[j]);
                    console.log("i" + i);
                    dbRemove(i, j, globalShop,dbo);

                })
                .then((err, db) => {
                    // checkAllVariants(abid, myquery);

                    if (checkAllVariants) {
                        var newvalues = { $pull: { "badge": { "abid": ObjectId(req.body.pid[i].bid[j]) } } };
            
                        dbo.collection(globalShop).updateOne(myquery, newvalues, function (err, obj) {
                            if (err) throw err;
                            console.log(globalShop);
                            console.log("removed badge from product: " + obj);
                        });
            
                        console.log(myquery);
                    }

                })

        }
    }

}



async function checkAllVariants(abid, myquery) {
    var deleteBadge = true;
    dbo.collection(globalShop).findOne(myquery, { projection: { "variants.id": 1 } }, function (err, obj) {
        console.log("varID");
        console.log(obj);
        for (var k = 0; k < obj.variants.length; k++) {
            var myquery2 = {
                "variants.id": obj.variants[k].id,
                "variants.badge.abid": abid
            };

            // await dbcheck(myquery2);

            dbo.collection(globalShop).findOne(myquery2, function (err, res) {
                if (err) throw err;
                console.log("product check Vid: " + res);
                console.log(res);
                if (res != null) {
                    deleteBadge = false;
                }

            });

        }

    });
    console.log("delete badge check:" + deleteBadge);
    return deleteBadge;

}

// async function getIds() {
//         for (var i = 0; i < req.body.pid.length; i++) {


//             //var i=0;
//             // while(i<req.body.pid.length){




//             for (var j = 0; j < req.body.pid[i].abid.length; j++) {
//                 console.log(req.body.pid[i].abid[j]);
//                 console.log("i" + i);
//                 await dbRemove(i, j, globalShop);
//             }
//         }
//     }
async function dbRemove(i, j, globalShop) {
    var myquery = {
        "_id": ObjectId(req.body.pid[i].prodid)
    };
    var badges = [];
    if (req.body.filter == "Price") {
        var myquery3 = {
            "variants.id": parseFloat(req.body.pid[i].vid)
        };

        console.log("myquery3");
        console.log(myquery3);


        dbo.collection(globalShop).updateOne(myquery3, { $pull: { "variants.$.badge": { "abid": ObjectId(req.body.pid[i].bid[j]) } } }, console.log(myquery3), function (err, res) {
            if (err) throw err;
            console.log("product updated Vid: " + res);

            console.log(myquery3);
            //console.log("product updated Bid: " + req.body.bid);


        });

        check = await checkAllVariants(ObjectId(req.body.pid[i].bid[j]), myquery);
        // if (checkAllVariants) {
        //     var newvalues = { $pull: { "badge": { "abid": ObjectId(req.body.pid[i].bid[j]) } } };

        //     dbo.collection(globalShop).updateOne(myquery, newvalues, function (err, obj) {
        //         if (err) throw err;
        //         console.log(globalShop);
        //         console.log("removed badge from product: " + obj);
        //     });

        //     console.log(myquery);
        // }

    } else {


        var newvalues = { $pull: { "badge": { "abid": ObjectId(req.body.pid[i].bid[j]) } } };
        console.log(req.body.pid[i].abid[j]);

        dbo.collection(globalShop).updateOne(myquery, newvalues, function (err, obj) {
            if (err) throw err;
            console.log("removed badge from product: " + obj);
            console.log("i2" + i);
            console.log(globalShop);
        });




        console.log(myquery);

        dbo.collection(globalShop).findOne(myquery, { projection: { "variants.id": 1 } }, function (err, obj) {
            console.log("varID");
            console.log(obj);
            console.log("i3" + i);
            for (var k = 0; k < obj.variants.length; k++) {
                var myquery2 = {
                    "variants.id": obj.variants[k].id
                };

                console.log(myquery2);
                console.log(j);
                console.log(i);
                console.log(k);
                console.log(globalShop);
                console.log(obj.variants.length);
                console.log(req.body.pid[i]);
                console.log(req.body.pid[i].abid[j]);
                // await dbRemove(i, j, globalShop);

                //     }

                // });// await variantRemove(i, j, globalShop,myquery2)

                // }

                // var newvalues1 = { $pull: { "variants.$.badge.abid": req.body.pid[i].abid[j] } };

                //async function variantRemove(i, j, globalShop,myquery2) {
                dbo.collection(globalShop).updateOne(myquery2, { $pull: { "variants.$.badge": { "abid": ObjectId(req.body.pid[i].bid[j]) } } }, console.log(myquery2), function (err, res) {
                    if (err) throw err;
                    console.log("product updated Vid: " + res);
                    console.log("product updated Vid: " + k);
                    console.log(myquery2);
                    //console.log("product updated Bid: " + req.body.bid);


                });

            }

        });// await variantRemove(i, j, globalShop,myquery2)
    }

    return check;

}
    // }



        // async function dbcheck(myquery2){
        //     dbo.collection(globalShop).findOne(myquery2, function (err, res) {
        //         if (err) throw err;
        //         console.log("product check Vid: " + res);
        //         // console.log(res);
        //         if (res != null) {
        //             deleteBadge = false;
        //         }

        //     });
        // }

        // getIds();
