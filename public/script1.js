// /* Sample JavaScript file added with ScriptTag resource. 
// This sample file is meant to teach best practices.
// Your app will load jQuery if it's not defined. 
// Your app will load jQuery if jQuery is defined but is too old, e.g. < 1.7. 
// Your app does not change the definition of $ or jQuery outside the app. 
// Example: if a Shopify theme uses jQuery 1.4.2, both of these statements run in the console will still return '1.4.2'
// once the app is installed, even if the app uses jQuery 1.9.1:
// jQuery.fn.jquery => "1.4.2" 
// $.fn.jquery -> "1.4.2"
// */

// /* Using a self-executing anonymous function - (function(){})(); - so that all variables and functions defined within 
// aren’t available to the outside world. */

// (function () {

//   /* Load Script function we may need to load jQuery from the Google's CDN */
//   /* That code is world-reknown. */
//   /* One source: http://snipplr.com/view/18756/loadscript/ */
//   const forwardingAddress = "https://a2f68b34.ngrok.io";

//   var loadScript = function (url, callback) {

//     var script = document.createElement("script");
//     script.type = "text/javascript";

//     // If the browser is Internet Explorer.
//     if (script.readyState) {
//       script.onreadystatechange = function () {
//         if (script.readyState == "loaded" || script.readyState == "complete") {
//           script.onreadystatechange = null;
//           callback();
//         }
//       };
//       // For any other browser.
//     } else {
//       script.onload = function () {
//         callback();
//       };
//     }

//     script.src = url;
//     document.getElementsByTagName("head")[0].appendChild(script);

//   };

//   /* This is my app's JavaScript */
//   var myAppJavaScript = function ($) {

//     // $ in this scope references the jQuery object we'll use.
//     // Don't use jQuery, or jQuery191, use the dollar sign.
//     // Do this and do that, using $.
//     $('body').append('<p>Your app is using jQuery version ' + $.fn.jquery + '</p>');

//     if (window.location.pathname.indexOf('products') > -1) {

//       var productId = $('#ProductSection-product-template').data('product-id');
//       $.ajax({

//         url: forwardingAddress + '/getSrc/' + productId,
//         type: 'GET',
//         success: function (data) {
//           if (data) {
//             for (var j = 0; j < data.images.length; j++) {
//               console.log(data.images.length);
//               console.log(j);
//               var psrc = data.images[j].src;
//               var trim = psrc.replace("https:", "");
//               console.log("trim:", trim);
//               // trim = trim.replace(".jpg", "_300x300.jpg"); //_300x300.jpg
//               var sp = trim.split(".jpg");
//               trim = sp[0]
//               console.log("src", trim);
//               var xi = $("img[src^='" + trim + "']");

//               for (var i = 0; i < data.badge.length; i++) {
//                 console.log('in badge image success' + data.badge[i].x);
//                 console.log('in badge image success' + data.badge[i].y);
//                 var x = data.badge[i].x;
//                 var y = data.badge[i].y;
//                 console.log('in badge image success' + data.badge[i].Bid);
//                 // var id = $('.productid').eq(0).html;
//                 // console.log("id:::::",id);

//                 var link = data.badge[i].imageSource.replace("http://localhost:3000", forwardingAddress);
//                 //  $('.product-single__photo-wrapper').eq(0).css('position', 'relative');

//                 xi.eq(0).after('<div class="badge-wrapper"><img style="position:absolute ; top :' + y + 'px;height:60px;width:60px; left:' + x + 'px;" src="' + link + '"></div>');
//                 //  $('.product-single__photo-wrapper').eq(0).append('<img src="' + link + '" class="tricon-badge" alt="Badge" height="60" width="60" style="position:absolute ; top :'+ y +'px; left:'+x +'px;">');            
//               }
//               console.log("append", trim);
//             }

//           }
//         }

//       })




//     }

//   };

//   /* If jQuery has not yet been loaded or if it has but it's too old for our needs,
//   we will load jQuery from the Google CDN, and when it's fully loaded, we will run
//   our app's JavaScript. Set your own limits here, the sample's code below uses 1.7
//   as the minimum version we are ready to use, and if the jQuery is older, we load 1.9. */
//   if ((typeof jQuery === 'undefined') || (parseFloat(jQuery.fn.jquery) < 1.7)) {
//     loadScript('//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js', function () {
//       jQuery191 = jQuery.noConflict(true);
//       myAppJavaScript(jQuery191);
//     });
//   } else {
//     myAppJavaScript(jQuery);
//   }

// })();
