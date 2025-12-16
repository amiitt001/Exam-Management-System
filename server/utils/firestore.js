const admin = require('firebase-admin');

function buildCredential() {
	// Option 1: full service account JSON
	const svcJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
	if (svcJson) {
		return admin.credential.cert(JSON.parse(svcJson));
	}

	// Option 2: triple env vars
	const projectId = process.env.FIREBASE_PROJECT_ID;
	const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
	const privateKey = (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n');

	if (projectId && clientEmail && privateKey) {
		return admin.credential.cert({ projectId, clientEmail, privateKey });
	}

	// Option 3: Default application credentials (Cloud Run recommended)
	return admin.credential.applicationDefault();
}

if (!admin.apps.length) {
	admin.initializeApp({
		credential: buildCredential(),
	});
}

const db = admin.firestore();

module.exports = { admin, db };
