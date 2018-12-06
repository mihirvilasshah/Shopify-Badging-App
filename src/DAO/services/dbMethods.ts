const ObjectID = require('mongodb').ObjectID;

export async function getbadges(badges) {
  try {
    const result = await resultBadges(badges);
    async function resultBadges(badge) {
      return new Promise((resolve, reject) => {
        badge
          .find({}, { projection: { imageSource: 1, thumbnailSource: 1 } })
          .toArray((error, results) => {
            if (error) throw error;
            resolve(results);
          });
      });
    }
    return result;
  } catch (e) {
    throw e;
  }
}
