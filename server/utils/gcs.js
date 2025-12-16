const { Storage } = require('@google-cloud/storage');

// Uses Application Default Credentials on Cloud Run. Locally, set GOOGLE_APPLICATION_CREDENTIALS or use gcloud auth.
const storage = new Storage();

async function uploadBuffer({ bucketName, destination, buffer, contentType = 'application/octet-stream', public = false }) {
  const bucket = storage.bucket(bucketName);
  const file = bucket.file(destination);

  await file.save(buffer, {
    contentType,
    metadata: { contentType },
    resumable: false,
    validation: 'crc32c',
  });

  if (public) {
    await file.makePublic();
    return `https://storage.googleapis.com/${bucketName}/${destination}`;
  }

  // Signed URL (read) valid for 1 hour
  const [url] = await file.getSignedUrl({ action: 'read', expires: Date.now() + 60 * 60 * 1000 });
  return url;
}

module.exports = { uploadBuffer };
