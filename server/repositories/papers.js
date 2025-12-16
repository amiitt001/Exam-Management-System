const { db, admin } = require('../utils/firestore');

const COLLECTION = 'papers';

async function createPaper(doc) {
  const payload = {
    ...doc,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  };
  const ref = await db.collection(COLLECTION).add(payload);
  return { id: ref.id, ...doc };
}

async function listPapers() {
  const snap = await db.collection(COLLECTION).orderBy('createdAt', 'desc').get();
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      ...data,
      createdAt: data.createdAt && data.createdAt.toDate ? data.createdAt.toDate() : data.createdAt,
    };
  });
}

module.exports = { createPaper, listPapers };
