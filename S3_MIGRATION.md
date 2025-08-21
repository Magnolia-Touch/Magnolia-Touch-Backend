# S3 Media Storage Migration

This project has been migrated from internal database media storage to Amazon S3 for better scalability and performance.

## Changes Made

### 1. S3 Service Integration
- Created `S3Module` and `S3Service` for handling file operations
- Integrated AWS SDK v3 for S3 operations
- Added file validation for type and size

### 2. New File Upload Endpoints

#### Profile Images
- `POST /memories/upload-profile-image` - Upload profile or background images
  - Query params: `code` (profile slug), `type` ('profile' or 'background')
  - Body: FormData with `file` field
  - Authentication: Required (JWT)

#### Gallery Media
- `POST /memories/upload-media` - Upload single photo/video to gallery
  - Query params: `code` (profile slug), `mediatype` ('photos' or 'videos')
  - Body: FormData with `file` field
  - Authentication: Required (JWT)

- `POST /memories/upload-multiple-media` - Upload multiple files at once
  - Query params: `code` (profile slug), `mediatype` ('photos' or 'videos')
  - Body: FormData with `files` field (up to 10 files)
  - Authentication: Required (JWT)

#### Guestbook Photos
- `POST /memories/upload-guestbook-photo` - Add guestbook entry with photo
  - Query params: `code` (profile slug)
  - Body: FormData with `photo` field + guestbook data
  - Authentication: Not required (public endpoint)

### 3. File Validation
- **Images**: JPEG, PNG, GIF, WebP (max 5-10MB)
- **Videos**: MP4, AVI, MOV, WMV, FLV (max 50MB)
- **Profile/Background images**: max 5MB
- **Gallery photos**: max 10MB
- **Guestbook photos**: max 5MB

### 4. S3 File Organization
Files are organized in S3 with the following structure:
```
profiles/
  {slug}/
    profile-images/
    background-images/
    gallery/
      photos/
      videos/
    guestbook-photos/
```

### 5. Automatic Cleanup
- When deleting media items, files are automatically removed from S3
- When updating profile/background images, old images are deleted from S3
- Graceful error handling if S3 deletion fails

## Environment Variables Required

```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_S3_BUCKET_NAME=your-bucket-name
```

## Legacy Endpoints
The following endpoints still work for URL-based media (links):
- `POST /memories/add-media` - Add media by URL (links only)
- `DELETE /memories/delete-media` - Delete media items

## API Usage Examples

### Upload Profile Image
```bash
curl -X POST "http://localhost:3000/memories/upload-profile-image?code=ABC123&type=profile" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@profile-photo.jpg"
```

### Upload Gallery Photo
```bash
curl -X POST "http://localhost:3000/memories/upload-media?code=ABC123&mediatype=photos" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@gallery-photo.jpg"
```

### Upload Multiple Photos
```bash
curl -X POST "http://localhost:3000/memories/upload-multiple-media?code=ABC123&mediatype=photos" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "files=@photo1.jpg" \
  -F "files=@photo2.jpg" \
  -F "files=@photo3.jpg"
```

### Upload Guestbook with Photo
```bash
curl -X POST "http://localhost:3000/memories/upload-guestbook-photo?code=ABC123" \
  -F "photo=@guest-photo.jpg" \
  -F "first_name=John" \
  -F "last_name=Doe" \
  -F "message=Beautiful memories" \
  -F "guestemail=john@example.com"
```

## Benefits of S3 Migration
1. **Scalability**: No database size limits for media storage
2. **Performance**: Faster media delivery via S3 CDN
3. **Cost-effective**: Pay only for storage used
4. **Reliability**: AWS S3 99.999999999% durability
5. **Global availability**: Content delivered from edge locations
