# Firebase Storage Security Rules for Audio Files

## Current File Structure
Your audio file is located at:
```
/ACA Enrollment_ Guidelines and Resources for 2025.wav
```

## Firebase Storage Rules

In your Firebase Console, go to Storage > Rules and use this configuration:

```javascript
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    // Allow public read access to audio files
    match /{audioFile} {
      allow read: if true;
      allow write: if request.auth != null; // Only authenticated users can upload
    }
    
    // More specific rule for your audio file
    match /ACA%20Enrollment_%20Guidelines%20and%20Resources%20for%202025.wav {
      allow read: if true; // Public read access
    }
    
    // Alternative: Allow all files in root to be publicly readable
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## Path Explanation

The path in Firebase Storage rules uses URL encoding:
- Spaces become `%20`
- Your file: `ACA Enrollment_ Guidelines and Resources for 2025.wav`
- Becomes: `ACA%20Enrollment_%20Guidelines%20and%20Resources%20for%202025.wav`

## Recommended Simple Rule

For your use case, the simplest rule is:

```javascript
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    // Allow public read access to all files
    // Only authenticated users can write
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## Steps to Apply Rules

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Storage in the left sidebar
4. Click on the "Rules" tab
5. Replace the existing rules with one of the above configurations
6. Click "Publish"

## Testing the Rules

After applying the rules, test by accessing your file URL directly in a browser:
```
https://firebasestorage.googleapis.com/v0/b/YOUR-PROJECT-ID.appspot.com/o/ACA%20Enrollment_%20Guidelines%20and%20Resources%20for%202025.wav?alt=media
```

If it downloads/plays, the rules are working correctly!

## Security Notes

- `allow read: if true` makes files publicly accessible
- `allow write: if request.auth != null` requires authentication for uploads
- This is appropriate for public audio content like podcasts
- For sensitive files, you'd want more restrictive read rules
