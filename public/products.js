// const dotenv = require('dotenv').config();
// const forwardingAddress = process.env.FORWARDING_ADDRESS;

function onLoad() {
    var productHolder = document.getElementById('productHolder');

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            // Typical action to be performed when the document is ready:
            /// document.getElementById("demo").innerHTML = xhttp.responseText;

            var products = JSON.parse(xhttp.responseText).products; // [{name : "P1", id  :1},{name : "P2", id  :2}] // respose.products;
            var t = document.getElementById('prod');
            var i = 0;

            products.forEach(function (product) {

                if (i == (products.length - 1)) {
                    console.log("if");
                    var header = t.createTHead();
                    var row = header.insertRow(0);
                    var cellH0 = row.insertCell(0);
                    var cellH1 = row.insertCell(1);
                    var cellH2 = row.insertCell(2);
                    cellH0.innerHTML = "SL NO"
                    cellH1.innerHTML = "PRODUCT NAME";
                    cellH2.innerHTML = "PRODUCT ID";

                }
                console.log(i);
                // console.log(type(product));
                console.log(products.length);
                var row = t.insertRow(i);
                var cell1 = row.insertCell(0);
                var cell2 = row.insertCell(1);
                var cell3 = row.insertCell(2);
                cell1.innerHTML = i + 1;
                cell2.innerHTML = `${product.title}`;
                cell3.innerHTML = `${product.id}`;
                //productHolder.append(`${product.title} : ${product.id} `);
                i++;
            });
        }
    };

    xhttp.open("GET", "https://3c7c6d64.ngrok.io/product", true);
    xhttp.send();



    //  fetch('http://localhost:3000/product',{content-}).then((respose)=>{
    //      console.log(respose.json());
    //      var products = respose.body.products // [{name : "P1", id  :1},{name : "P2", id  :2}] // respose.products;

    //      products.forEach(function(product){
    //          productHolder.append(`<p>${product.name} : ${product.id} </p>`);
    //      });
    //  }) 
}
