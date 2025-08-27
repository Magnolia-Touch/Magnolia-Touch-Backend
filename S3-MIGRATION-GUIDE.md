# S3 Migration Guide

🚀 **Your Magnolia Touch Backend has been successfully migrated to use AWS S3 for all media storage!**

## What Changed

### Before (Local Storage)
- Files stored in `./uploads/` and `./qr-images/` directories
- Database stored local file paths
- Server responsible for file management

### After (S3 Storage)
- All media files stored in AWS S3
- Database stores public S3 URLs
- Improved scalability and reliability
- No local file storage dependencies

## Required Environment Variables

Add these to your `.env` file:

```env
AWS_REGION=your-aws-region
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET_NAME=your-bucket-name
```

## S3 Folder Structure

Your S3 bucket will be organized as follows:

```
your-bucket/
├── flowers/                    # Flower images
├── services/                   # Service images
├── guestbook/{slug}/images/    # Guestbook photos
├── profiles/{slug}/            # Profile-specific media
│   ├── profile-images/         # Profile pictures
│   ├── background-images/      # Background images
│   └── gallery/
│       ├── photos/            # Gallery photos
│       └── videos/            # Gallery videos
└── qr-codes/                  # Generated QR codes
```

## Database Changes

All image/media fields now store S3 public URLs instead of local paths:

- `DeadPersonProfile.profile_image`
- `DeadPersonProfile.background_image`  
- `GuestBookItems.photo_upload`
- `Photos.url`
- `Videos.url`
- `Flowers.image`
- `Services.image`

## New API Endpoints

### Profile Images
```http
POST /memories/upload-profile-image?code={slug}&type=profile
POST /memories/upload-profile-image?code={slug}&type=background
```

### Gallery Media
```http
POST /memories/upload-media?code={slug}&mediatype=photos
POST /memories/upload-media?code={slug}&mediatype=videos
POST /memories/upload-multiple-media?code={slug}&mediatype=photos
```

### Existing Endpoints Updated
All existing upload endpoints now use S3:
- `POST /memories/add-guestbook` (with image)
- `POST /memories/add-media` (deprecated - use new endpoints)
- `POST /flowers/add-flower`
- `POST /services/create-service`

## Migration Steps

### 1. Set Up AWS S3
1. Create an S3 bucket
2. Configure public read access for uploaded files
3. Set up IAM user with S3 permissions
4. Add environment variables to your `.env`

### 2. Update Dependencies
Ensure your `package.json` includes:
```json
{
  "@aws-sdk/client-s3": "^3.x.x",
  "@aws-sdk/s3-request-presigner": "^3.x.x"
}
```

### 3. Migrate Existing Data (If Any)
If you have existing files:
1. Manually upload files to S3 following the folder structure
2. Update database records to use S3 URLs instead of local paths
3. Run: `node migration-script.js` to check migration status

### 4. Clean Up
After successful migration:
```bash
# Remove old local storage directories
rm -rf ./uploads/
rm -rf ./qr-images/
```

### 5. Test
- Test all media upload functionality
- Verify images display correctly
- Check QR code generation

## File Validation

The new system includes comprehensive file validation:

### Image Files
- **Allowed types**: JPEG, PNG, GIF, WebP
- **Max size**: 5MB (profile images), 10MB (gallery photos)

### Video Files
- **Allowed types**: MP4, AVI, MOV, WMV, FLV
- **Max size**: 50MB

## Error Handling

The system includes proper error handling for:
- Invalid file types
- File size limits
- S3 upload failures
- Network connectivity issues

## Benefits of S3 Migration

✅ **Scalability**: Handle unlimited file storage
✅ **Performance**: CDN-ready for fast global delivery
✅ **Reliability**: 99.999999999% durability
✅ **Cost-effective**: Pay only for what you use
✅ **Security**: Built-in security features
✅ **Backup**: Automatic redundancy across regions

## Troubleshooting

### Common Issues

1. **Environment variables not set**
   - Verify all AWS variables are in your `.env` file

2. **S3 bucket permissions**
   - Ensure bucket allows public read access
   - Check IAM user permissions

3. **File upload fails**
   - Check AWS credentials
   - Verify bucket exists and is accessible
   - Check file size and type restrictions

4. **Images not displaying**
   - Verify S3 URLs are correctly stored in database
   - Check bucket CORS configuration

### Support

If you encounter issues:
1. Check the migration script output: `node migration-script.js`
2. Verify environment variables are set correctly
3. Test S3 connectivity independently
4. Check application logs for detailed error messages

---

🎉 **Migration Complete!** Your application is now ready for scalable media storage with AWS S3.
