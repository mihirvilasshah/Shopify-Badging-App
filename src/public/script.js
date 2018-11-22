/* Using a self-executing anonymous function - (function(){})(); - so that all variables and functions defined within 
aren’t available to the outside world. */

(function() {
  const forwardingAddress = 'https://7a663a1e.ngrok.io'; // we use this to call apis from this url
  // function to load the jquery script to the page and calls one callback fuction in which we write our logic
  //-------------------------------------------------------------------------------------------------------------------
  var loadScript = function(url, callback) {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    // If the browser is Internet Explorer.
    if (script.readyState) {
      script.onreadystatechange = function() {
        if (script.readyState == 'loaded' || script.readyState == 'complete') {
          script.onreadystatechange = null;
          callback();
        }
      };
      // For any other browser.
    } else {
      script.onload = function() {
        callback();
      };
    }
    script.src = url;
    document.getElementsByTagName('head')[0].appendChild(script);
  };
  //---------------------------------------------------------------------------------------------------------------------------------------
  //callback function called loadscript in which we write logic to apply badge
  var myAppJavaScript = function($) {
    //-----------------------------------------------------------------------------------------------------------------------------------
    //function to get all the query parameters in url
    function getUrlVars() {
      var vars = {};
      var parts = window.location.href.replace(
        /[?&]+([^=&]+)=([^&]*)/gi,
        function(m, key, value) {
          vars[key] = value;
        }
      );
      return vars;
    }
    //------------------------------------------------------------------------------------------------------------------------------------
    //function returns the query parameter value based on query if query parameter is not there returns the default value
    function getUrlParam(parameter, defaultvalue) {
      var urlparameter = defaultvalue;
      if (window.location.href.indexOf(parameter) > -1) {
        urlparameter = getUrlVars()[parameter];
      }
      return urlparameter;
    }
    //-----------------------------------------------------------------------------------------------------------------------------------------
    // when the loaded page is product page run this code
    function productpage() {
      var productId = id; // we get the value of id from the script file loaded in snippets of shopify
      $.ajax({
        //ajax call to get the product details based on product id
        url: forwardingAddress + '/addBadge/getSrc/' + productId,
        type: 'GET',
        success: function(data) {
          if (data) {
            variantid = data.variants[0].id; // get the variant 0 id when page is loaded
            var applydbadges = []; //initially applied badges array is empty we get based on variant id
            var varlen = data.variants.length;
            applydbadges = data.variants[0].badge;
            // for (var i = 0; i < varlen; i++) {
            //   //get the badges for that variant
            //   if (variantid == data.variants[i].id) {
            //     applydbadges = data.variants[i].badge;

            //     break;
            //   }
            // }
            console.log(applydbadges);
            var imageslen = data.images.length;

            for (var j = 0; j < imageslen; j++) {
              //loop through the images array and apply badges for all the variants
              console.log(data.images.length);
              console.log(j);
              var psrc = data.images[j].src;
              var trim = psrc.replace('https:', '');
              console.log('trim:', trim);
              // trim = trim.replace(".jpg", "_300x300.jpg"); //_300x300.jpg
              var sp = trim.split('.jpg');
              trim = sp[0];
              console.log('src', trim);
              var xi = $("img[src^='" + trim + "']");
              var badgeids = [];
              if (data.badge) {
                for (var i = 0; i < data.badge.length; i++) {
                  //loop through the badge array and get all badge details to apply for each image
                  console.log('CHECK PID', id);
                  console.log('in badge image success' + data.badge[i].left);
                  console.log('in badge image success' + data.badge[i].top);
                  var left = data.badge[i].left;
                  var top = data.badge[i].top;
                  var width = data.badge[i].width;
                  var height = data.badge[i].height;
                  var borderRadius = data.badge[i].borderRadius;
                  badgeids[i] = data.badge[i].abid;
                  left = (left * 85) / 350;

                  top = (top * 77) / 225;
                  console.log('in badge image success' + data.badge[i].abid);
                  var link = data.badge[i].imageSource.replace(
                    'http://localhost:3000',
                    forwardingAddress
                  );
                  var flag = false;
                  if (applydbadges) {
                    applydbadgeslength = applydbadges.length;
                    for (var k = 0; k < applydbadgeslength; k++) {
                      //based on the apply badges to this variant we create the badge image to display or not
                      if (data.badge[i].abid == applydbadges[k].abid) {
                        flag = true;
                        break;
                      } else {
                        flag = false;
                      }
                    }
                  }
                  if (flag == false) {
                    //if badge not there in applybadges array we will display none
                    xi.eq(0).after(
                      '<div class= ' +
                        data.badge[i].abid +
                        ' style="display:none" ><img style="position:absolute ; top :' +
                        top +
                        '%;height:' +
                        height +
                        '%;width:' +
                        width +
                        '%; left:' +
                        left +
                        '%;border-radius:' +
                        borderRadius +
                        '%;" src="' +
                        link +
                        '"></div>'
                    );
                  }
                  if (flag == true) {
                    //else display block
                    xi.eq(0).after(
                      '<div class= ' +
                        data.badge[i].abid +
                        ' style="display:block"><img style="position:absolute ; top :' +
                        top +
                        '%;height:' +
                        height +
                        '%;width:' +
                        width +
                        '%; left:' +
                        left +
                        '%;border-radius:' +
                        borderRadius +
                        '%;" src="' +
                        link +
                        '"></div>'
                    );
                  }
                }
              } //end of badge array lopp
              console.log('append', trim);
            }

            //--------------------------------------------------------------------------------------------------------------------------------
            $('select')
              .change(function() {
                // when user change the select input we get the variant id and change the css properties of the badge
                var variantid = getUrlParam('variant', data.variants[0].id);
                console.log('variantid', variantid);
                var applydbadges = [];
                for (var i = 0; i < data.variants.length; i++) {
                  if (variantid == data.variants[i].id) {
                    applydbadges = data.variants[i].badge;
                    break;
                  }
                }
                var flag = false;
                if (data.badge) {
                  var badgelen = data.badge.length;
                  console.log(applydbadges);

                  for (var i = 0; i < badgelen; i++) {
                    if (applydbadges) {
                      var applydbadgeslength = applydbadges.length;
                      for (var k = 0; k < applydbadgeslength; k++) {
                        if (data.badge[i].abid == applydbadges[k].abid) {
                          flag = true;
                          break;
                        } else {
                          flag = false;
                        }
                      }
                    }
                    if (flag == false) {
                      $('.' + data.badge[i].abid).css('display', 'none');
                      console.log('none', data.badge[i].abid);
                    }
                    if (flag == true) {
                      $('.' + data.badge[i].abid).css('display', 'block');
                      console.log('block', data.badge[i].abid);
                    }
                  }
                } else {
                  for (var i = 0; i < badgelen; i++) {
                    $('.' + data.badge[i].abid).css('display', 'none');
                    console.log('done');
                  }
                }
              })
              .change();
          }
        }
      });
    }

    function collectionpage() {
      var pageimages = [];
      var images = jQuery(
        'img[src*="/products/"][src*="/cdn.shopify.com/s/files/"][src*=".jp"],img[src*="/products/"][src*="/cdn.shopify.com/s/files/"][src*=".JP"],img[src*="/products/"][src*="/cdn.shopify.com/s/files/"][src*=".png"],img[src*="/products/"][src*="/cdn.shopify.com/s/files/"][src*=".PNG"]'
      );
      images.each(function(index, image) {
        var src = jQuery(image).attr('src');
        pageimages.push(src);
        console.log(src);
      });
      console.log(pageimages);
      var data = {};
      data.src = pageimages;
      $.ajax({
        //ajax call to get the product details based on product id
        url: forwardingAddress + '/addBadge/getbadges',
        type: 'POST',
        data: JSON.stringify(data),
        contentType: 'application/json',
        success: function(result) {
          console.log(result);
          console.log(pageimages);
          prolength = result.length;

          for (i = 0; i < prolength; i++) {
            imgsrc = result[i].image.src;
            //             imgsrc = imgsrc.replace("https:", "");
            //             trim = imgsrc.replace(".jpg", "_300x300.jpg");
            //             var xi = $("img[src^='" + trim + "']");
            var s = imgsrc.split('=');
            var xi = $('img[src*=' + s[1] + ']');
            var badgeids = [];
            if (result[i].badge) {
              for (var j = 0; j < result[i].badge.length; j++) {
                //loop through the badge array and get all badge details to apply for each image

                console.log('in badge image success' + result[i].badge[j].left);
                console.log('in badge image success' + result[i].badge[j].top);
                var left = result[i].badge[j].left;
                var top = result[i].badge[j].top;
                var width = result[i].badge[j].width;
                var height = result[i].badge[j].height;
                var borderRadius = result[i].badge[j].borderRadius;
                badgeids[i] = result[i].badge[j].abid;
                left = (left * 85) / 350;

                top = (top * 77) / 225;
                console.log('in badge image success' + result[i].badge[j].abid);
                var link = result[i].badge[j].imageSource.replace(
                  'http://localhost:3000',
                  forwardingAddress
                );

                xi.eq(0).after(
                  '<div class= ' +
                    result[i].badge[j].abid +
                    ' ><img style="position:absolute ; top :' +
                    top +
                    '%;height:' +
                    height +
                    '%;width:' +
                    width +
                    '%; left:' +
                    left +
                    '%;border-radius:' +
                    borderRadius +
                    '%;" src="' +
                    link +
                    '"></div>'
                );
              }
            }
          }
        }
      });
    }
    var storeURL = window.location.pathname; // based on url identify page and call that function to apply badge to that page
    if (storeURL) {
      var matches = storeURL.match(/(.*)\/(.[products]+)\/(.*)/);
      if (page == 'product') {
        productpage();
      } else if (page == 'collection') {
        collectionpage();
      }
    }
  };
  //----------------------------------------------------------------------------------------------------------------------------------------------------
  if (typeof jQuery === 'undefined' || parseFloat(jQuery.fn.jquery) < 1.7) {
    loadScript(
      '//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js',
      function() {
        jQuery191 = jQuery.noConflict(true);
        myAppJavaScript(jQuery191);
      }
    );
  } else {
    myAppJavaScript(jQuery);
  }
})();