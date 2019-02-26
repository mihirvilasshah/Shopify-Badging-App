const s3 = require('../db');
exports.getMultiproducts = async (products, event) => {
    return new Promise((resolve, reject) => {
        
        let titles = [];
        let variants = [];
        let variants1 = '';
        let variants2 = '';
        let variants3 = '';
        let variantsId = [];
        let abids = [];
        let srcs = [];
        let pids = [];
        let tags1 = [];
        let createdat = [];
        let isApplied = [];
        let bids = [];
        let abid = [];
        if(Object.keys(event.query).length){
        for (let i = 0; i < products.length; i++) {
            if(products[i].variants){
            if(event.query.pr == 'all' ){
                       if((((event.query.d1)&&products[i].created_at > event.query.d1 && products[i].created_at < event.query.d2)||(!event.query.d1)) &&
             (((event.query.t1)&&RegExp(event.query.t1, 'i').test(products[i].title))||(!event.query.t1)) &&
             (((event.query.tg1)&&RegExp(event.query.tg1, 'i').test(products[i].tags))||(!event.query.tg1))  &&   products[i].badge && products[i].badge.length > 0
             ){
                 if(event.query.p1){
                       const p1 = event.query.p1;
                        const p2 = event.query.p2;
                     for (let j = 0; j < products[i].variants.length; j++) {
                       //  console.log(event.query.p1);
                 if(  parseFloat(products[i].variants[j].price) > (p1) &&
                        parseFloat(products[i].variants[j].price) < (p2) && products[i].variants[j].badge && products[i].variants[j].badge.length > 0
                     ){
                   //  console.log('price');
                      const p = badgemethod(products, i, j, titles, variants, variants1, variants2, variants3, variantsId, abids, srcs, pids, tags1, createdat, isApplied);
                     
                 }
                 
                 }
             }     else{
                 const p = datebadge(products, i, titles, variants, variants1, variants2, variants3, variantsId, abids, srcs, pids, tags1, createdat, isApplied, bids);
             }
            }
            } else{
          if((((event.query.d1)&&products[i].created_at > event.query.d1 && products[i].created_at < event.query.d2)||(!event.query.d1)) &&
             (((event.query.t1)&&RegExp(event.query.t1, 'i').test(products[i].title))||(!event.query.t1)) &&
             (((event.query.tg1)&&RegExp(event.query.tg1, 'i').test(products[i].tags))||(!event.query.tg1))  
             ){
                 if(event.query.p1){
                       const p1 = event.query.p1;
                        const p2 = event.query.p2;
                     for (let j = 0; j < products[i].variants.length; j++) {
                       //  console.log(event.query.p1);
                 if(  parseFloat(products[i].variants[j].price) > (p1) &&
                        parseFloat(products[i].variants[j].price) < (p2)
                     ){
                   //  console.log('price');
                      const p = badgemethod(products, i, j, titles, variants, variants1, variants2, variants3, variantsId, abids, srcs, pids, tags1, createdat, isApplied);
                     
                 }
                 
                 }
             }     else{
                 const p = datebadge(products, i, titles, variants, variants1, variants2, variants3, variantsId, abids, srcs, pids, tags1, createdat, isApplied, bids);
             }
            }
        }
        }
        }
    }
        resolve({
            items: titles,
            pids,
            badge: abids,
            tags: tags1,
            created_at: createdat,
            isApplied,
            src: srcs,
            variants,
            variantsId
        });
        
})}

function badgemethod(products, i, j, titles, variants, variants1, variants2, variants3, variantsId, abids, srcs, pids, tags1, createdat, isApplied) {

    titles.push(products[i].title);

    const ab = [];
    const src = [];
    variants1 = products[i].variants[j].option1;
    let a;

    if (variants1 != null) {
       a =variants1;
    } 
    variants2 = products[i].variants[j].option2;
    if (variants2 != null) {
         a = a + ',' + variants2;
    }
    variants3 = products[i].variants[j].option3;

    if (variants3 != null) {
       a = a + ',' + variants3;
    }
   // const a = variants1 + ',' + variants2 + ',' + variants3;
    variants.push(a);

    variantsId.push(products[i].variants[j].id);
    // console.log(variants[i]);
    pids.push(products[i].id);

    const x = products[i].created_at.split('T');
    createdat.push(x[0]);

    tags1.push(products[i].tags);
    if (
        products[i].variants[j].badge &&
        products[i].variants[j].badge.length > 0
    ) {
        let k = 0;

        while (products[i].variants[j].badge[k]) {
            ab[k] = products[i].variants[j].badge[k].abid;
            src[k] = products[i].variants[j].badge[k].thumbnailSource;

            k++;
        }
        abids.push(ab);
        srcs.push(src);


        isApplied.push('yes');
    } else {
        isApplied.push('no');
        abids.push('-');
        srcs.push('-');
    }

}
// -----------------------------------------------------------------------------------------------


function datebadge(products, i, titles, variants, variants1, variants2, variants3, variantsId, abids, srcs, pids, tags1, createdat, isApplied, bids) {
    const b = [];
    const ab = [];
    const src = [];
    titles.push(products[i].title);
    pids.push(products[i].id);
    const x = products[i].created_at.split('T');
    createdat.push(x[0]);
    tags1.push(products[i].tags);
    if (products[i].badge && products[i].badge.length > 0) {
        let j = 0;

        while (products[i].badge[j]) {
            b[j] = products[i].badge[j].Bid;
            ab[j] = products[i].badge[j].abid;
            src[j] = products[i].badge[j].thumbnailSource;
            console.log('b', b[j]);
            j++;
        }
        bids.push(b);
        abids.push(ab);
        srcs.push(src);
        isApplied.push('yes');
    } else {
        isApplied.push('no');
        let j = 0;

        b.push('-');
        ab.push('-');
        j++;
        bids.push(b);
        abids.push(ab);
        srcs.push(src);
    }


}
// ---------------------------------------------------------------------------------------
