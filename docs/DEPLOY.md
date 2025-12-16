# Deployment Guide

## Overview
- Frontend: Vercel (serves client/build via vercel.json).
- Backend (Node API): Cloud Run service built from server/Dockerfile.
- Python PDF Service (Flask): Cloud Run service built from python-service/Dockerfile.
- Storage: Google Cloud Storage (optional) for inputs/outputs when `GCS_BUCKET` is set.
- Database: Firestore (via `USE_FIRESTORE=true`) using ADC on Cloud Run.

## Prerequisites
- Google Gemini API key (GEMINI_API_KEY) for paper generation.
- Python service URL (PYTHON_SERVICE_URL) once deployed.

## Cloud Run (Backend Services)
You’ll deploy the Node API and Python service as separate Cloud Run services using the provided Dockerfiles.

1) Build & push images (Artifact Registry recommended):

```bash
# One-time: create an Artifact Registry repo
gcloud artifacts repositories create exam-gen --repository-format=docker --location=REGION

# Node API image
gcloud builds submit server \
   --tag REGION-docker.pkg.dev/PROJECT_ID/exam-gen/exam-generator-api:latest

# Python service image
gcloud builds submit python-service \
   --tag REGION-docker.pkg.dev/PROJECT_ID/exam-gen/exam-generator-python:latest
```

2) Deploy to Cloud Run:

```bash
# Python service first (get its URL afterward)
gcloud run deploy exam-generator-python \
   --image REGION-docker.pkg.dev/PROJECT_ID/exam-gen/exam-generator-python:latest \
   --region REGION \
   --allow-unauthenticated

# Node API (set env vars, including PYTHON_SERVICE_URL to the URL from above)
gcloud run deploy exam-generator-api \
   --image REGION-docker.pkg.dev/PROJECT_ID/exam-gen/exam-generator-api:latest \
   --region REGION \
   --allow-unauthenticated \
   --set-env-vars GEMINI_API_KEY=your_gemini_key,PYTHON_SERVICE_URL=https://<python-service-url>,USE_FIRESTORE=true
```

3) Verify health:

```bash
curl https://<api-service-url>/health
curl https://<python-service-url>/health
```

## Cloud Run (Console UI Walkthrough)

### Part 1: Deploy the Python Service (Flask)
1. Open Google Cloud Console → Cloud Run → CREATE SERVICE.
2. Source: Select "Continuously deploy new revisions from a source repository" → Set up Cloud Build → GitHub → choose your repo and branch (e.g., `main`).
3. Build Type: Dockerfile. Source location: select `python-service/Dockerfile`.
4. Service Name: `exam-python-service`. Region: pick closest (e.g., `us-central1` or `asia-south1`).
5. Authentication: Allow unauthenticated.
6. Container → Variables & Secrets: No variables are required for the Python service. (Optional: `FLASK_DEBUG=0`.)
7. Create and wait for green check. Copy the service URL (e.g., `https://exam-python-service-xyz.run.app`).

### Part 2: Deploy the Node.js API (Express)
1. Cloud Run → CREATE SERVICE.
2. Source: same repo and branch.
3. Build Type: Dockerfile. Source location: select `server/Dockerfile`.
4. Service Name: `exam-node-api`. Region: same as above. Authentication: Allow unauthenticated.
5. Container → Variables & Secrets → Add variables:
   - `GEMINI_API_KEY`: your Gemini key (for paper generation).
   - `PYTHON_SERVICE_URL`: the URL copied from the Python service.
   - `USE_FIRESTORE=true` plus Firestore credentials (see Notes below) or rely on ADC on Cloud Run.
6. Create and wait for green check. Copy the API URL (e.g., `https://exam-node-api-abc.run.app`).

### Part 3: Frontend (Vercel)
1. Vercel → Project → Settings → Environment Variables.
2. Set your API base var (e.g., `REACT_APP_API_BASE` or `REACT_APP_API_URL`) to the Cloud Run Node API URL (append `/api` if your client expects that path).
3. Redeploy the frontend.

## Vercel (Frontend)
- Root: repository root (vercel.json controls build/output)
- Build: client/package.json → react-scripts build
- Output: client/build
- Optional env: REACT_APP_API_BASE=https://<your-node-service>.onrender.com/api

## Health Checks
- Node: GET https://<node-service>/health
- Python: GET https://<python-service>/health

## Local Development
```bash
# Terminal 1 (Node API)
cd server
npm install
npm start

# Terminal 2 (Python service)
cd ../python-service
pip install -r requirements.txt
# Windows PowerShell
$env:PORT=5001; $env:FLASK_DEBUG=1; python app.py
```

## Notes
- Do NOT commit server/.env. Prefer Cloud Run service env vars.
- Update PYTHON_SERVICE_URL on the Node service after the Python service URL is available.
- Verify /api/convert-to-pdf and paper generation endpoints after deployment.

### Using Firestore on Cloud Run
## GitHub Actions (CI/CD to Cloud Run)
Two workflows are included:
- .github/workflows/deploy-python-cloudrun.yml
- .github/workflows/deploy-api-cloudrun.yml

Required GitHub Secrets:
- GCP_PROJECT_ID: Your GCP project ID
- GCP_REGION: e.g., us-central1 or asia-south1
- GAR_REPO: Artifact Registry repo name (e.g., exam-gen)
- WORKLOAD_IDENTITY_PROVIDER: Full resource name of your WIF provider
- SERVICE_ACCOUNT_EMAIL: Service account email with Cloud Run + Artifact Registry permissions
- GEMINI_API_KEY, PYTHON_SERVICE_URL: For Node API deployment
- Optional Firestore: USE_FIRESTORE, FIREBASE_* or FIREBASE_SERVICE_ACCOUNT_JSON

On push to main affecting each service’s folder, the corresponding workflow builds, pushes to Artifact Registry, and deploys to Cloud Run.
- Default datastore is Firestore. Set `USE_FIRESTORE=true` on the Node API service (recommended on Cloud Run with ADC).
- Credentials options:
   - Recommended (on Cloud Run in same project): Use Application Default Credentials (no extra vars).
   - Or provide credentials via env:
      - Triple: `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` (escape newlines as `\n`).
      - Or single var: `FIREBASE_SERVICE_ACCOUNT_JSON` (full JSON string).

### Using Firestore on Cloud Run
- If the service runs in the same GCP project with Workload Identity, set `USE_FIRESTORE=true` and omit explicit credentials to use Application Default Credentials.
- Otherwise, provide credentials via env:
   - Triple: `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` (escape newlines as `\n`)
   - Or one var: `FIREBASE_SERVICE_ACCOUNT_JSON` (full JSON string)

### Using Cloud Storage
- Create a bucket and grant your Cloud Run service account `Storage Object Admin` on the bucket.
- Set `GCS_BUCKET` env var on the Node API service to your bucket name.
- The API will upload:
   - Excel inputs to `inputs/` and include an `X-Input-URL` header.
   - Generated PDFs to `seating/` or `papers/` and include an `X-File-URL` header (signed URL by default).

## Console Deployment Checklist (Quick)
1) Python Service (Flask)
   - Console → Cloud Run → CREATE SERVICE → GitHub (main) → Build type Dockerfile → source: `python-service/Dockerfile`
   - Allow unauthenticated; no env vars required; region nearest to users
   - Deploy, copy service URL

2) Node API (Express)
   - Console → Cloud Run → CREATE SERVICE → GitHub (main) → Build type Dockerfile → source: `server/Dockerfile`
   - Allow unauthenticated; region same as Python
   - Env vars:
     - `GEMINI_API_KEY`=your key
     - `PYTHON_SERVICE_URL`=<Python URL from step 1>
     - `USE_FIRESTORE`=true
     - Optional storage: `GCS_BUCKET`=<your bucket>
     - Optional Firestore creds (if not using ADC): `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` (\n escaped) or `FIREBASE_SERVICE_ACCOUNT_JSON`
   - Deploy, copy API URL; health check `/health`

3) Vercel Frontend
   - Project → Settings → Env Vars: `REACT_APP_API_BASE`=https://<api-url>/api
   - Redeploy
