# Google Cloud Storage Setup for Audio File

## Overview
To resolve the large audio file issue (85MB), we're moving the audio file to Google Cloud Storage which can efficiently serve large files with proper streaming support.

## Steps to Set Up Google Cloud Storage

### 1. Create a Google Cloud Storage Bucket

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to Cloud Storage > Buckets
3. Click "Create Bucket"
4. Choose a unique bucket name (e.g., `your-project-aca-audio`)
5. Select a region close to your users
6. Choose "Standard" storage class
7. Set access control to "Fine-grained"
8. Create the bucket

### 2. Upload the Audio File

1. In your bucket, click "Upload files"
2. Select the `public/aca-enrollment-guidelines-2025.wav` file (85MB)
3. Wait for upload to complete

### 3. Make the File Public

1. Click on the uploaded file
2. Go to "Permissions" tab
3. Click "Add members"
4. Add `allUsers` as a member
5. Select role "Storage Object Viewer"
6. Save

### 4. Get the Public URL

The public URL will be:
```
https://storage.googleapis.com/YOUR-BUCKET-NAME/aca-enrollment-guidelines-2025.wav
```

### 5. Update the Application

Replace `your-bucket-name` in `src/app/page.tsx` with your actual bucket name:

```typescript
audioSrc="https://storage.googleapis.com/YOUR-ACTUAL-BUCKET-NAME/aca-enrollment-guidelines-2025.wav"
```

## Benefits of Google Cloud Storage

- ✅ Handles large files efficiently (85MB+)
- ✅ Global CDN for fast loading
- ✅ Proper HTTP range request support for audio streaming
- ✅ No file size limits like GitHub/Vercel
- ✅ Built-in compression and optimization
- ✅ Reliable and scalable

## Cost

Google Cloud Storage is very affordable:
- Storage: ~$0.02/month for 85MB
- Bandwidth: ~$0.12/GB for downloads
- Total estimated cost: <$1/month for typical usage

## Alternative: Compress the Audio

If you prefer not to use Google Cloud Storage, you can compress the audio file:

1. Convert WAV to MP3 (much smaller file size)
2. Reduce bitrate (e.g., 128kbps instead of high quality)
3. This could reduce the 85MB file to ~10-15MB

Let me know which approach you'd prefer!
