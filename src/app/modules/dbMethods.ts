const ObjectID = require('mongodb').ObjectID;
const getbadges = async badges => {
  try {
    const result = await badges
      .find({}, { projection: { imageSource: 1, thumbnailSource: 1 } })
      .toArray((error, results) => {
        if (error) throw error;
        // res.setHeader('content-type', results.contentType);
        const obj = [];
        for (let i = 0; i < results.length; i++) {
          obj[i] = {
            _id: results[i]._id,
            imageSource: results[i].imageSource,
            thumbnailSource: results[i].thumbnailSource,
            default: false
          };
        }
        console.log(obj);
        return obj;
      });
  } catch (e) {
    throw e;
  }
};
module.exports = { getbadges };
