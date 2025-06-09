# Step-by-Step Google Cloud Storage Setup

## Quick Setup (5 minutes)

### Step 1: Create Google Cloud Account
1. Go to https://console.cloud.google.com/
2. Sign in with your Google account
3. Accept terms and create a new project (or use existing)

### Step 2: Enable Cloud Storage
1. In the Google Cloud Console, click the hamburger menu (☰)
2. Navigate to "Cloud Storage" → "Buckets"
3. If prompted, enable the Cloud Storage API

### Step 3: Create a Bucket
1. Click "CREATE BUCKET"
2. **Bucket name**: Choose something unique like `aca-audio-[your-name]` (must be globally unique)
3. **Location**: Choose "Region" and select closest to your users (e.g., us-central1)
4. **Storage class**: Select "Standard"
5. **Access control**: Choose "Fine-grained"
6. **Protection tools**: Leave defaults
7. Click "CREATE"

### Step 4: Upload Your Audio File
1. Click on your newly created bucket
2. Click "UPLOAD FILES"
3. Select the file: `public/aca-enrollment-guidelines-2025.wav` (85MB)
4. Wait for upload to complete (may take 1-2 minutes)

### Step 5: Make File Public
1. Find your uploaded file in the bucket
2. Click the 3-dots menu (⋮) next to the file
3. Select "Edit permissions"
4. Click "ADD ENTRY"
5. **Entity**: Select "Public"
6. **Name**: Type `allUsers`
7. **Access**: Select "Reader"
8. Click "SAVE"

### Step 6: Get the Public URL
Your file URL will be:
```
https://storage.googleapis.com/YOUR-BUCKET-NAME/aca-enrollment-guidelines-2025.wav
```

Example: If your bucket is named `aca-audio-john`, the URL would be:
```
https://storage.googleapis.com/aca-audio-john/aca-enrollment-guidelines-2025.wav
```

### Step 7: Update Your Code
1. Open `src/app/page.tsx`
2. Find this line:
   ```typescript
   audioSrc="https://storage.googleapis.com/your-bucket-name/aca-enrollment-guidelines-2025.wav"
   ```
3. Replace `your-bucket-name` with your actual bucket name
4. Save the file

### Step 8: Test
1. Deploy your app or run locally
2. The podcast widget should now load and play properly!

## Alternative: Use gsutil Command Line (Advanced)

If you prefer command line:

```bash
# Install Google Cloud SDK
# Then authenticate
gcloud auth login

# Create bucket
gsutil mb gs://your-bucket-name

# Upload file
gsutil cp public/aca-enrollment-guidelines-2025.wav gs://your-bucket-name/

# Make public
gsutil acl ch -u AllUsers:R gs://your-bucket-name/aca-enrollment-guidelines-2025.wav
```

## Troubleshooting

**File not loading?**
- Check the bucket name in your code matches exactly
- Verify the file is public (try accessing the URL directly in browser)
- Check browser console for CORS errors

**CORS Issues?**
If you get CORS errors, create a `cors.json` file:
```json
[
  {
    "origin": ["*"],
    "method": ["GET"],
    "maxAgeSeconds": 3600
  }
]
```

Then apply it:
```bash
gsutil cors set cors.json gs://your-bucket-name
```

## Cost Estimate
- Storage: $0.020/GB/month = ~$0.002/month for 85MB
- Network egress: $0.12/GB = ~$0.01 per 85MB download
- **Total**: Less than $1/month for typical usage

## Security Note
The file will be publicly accessible via the URL. This is normal for podcast/audio files that need to be streamed on websites.
