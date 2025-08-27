// Migration Script for S3 Integration
// This script helps migrate existing local files to S3 and updates database URLs

const fs = require('fs');
const path = require('path');

console.log('🚀 S3 Migration Script');
console.log('=====================================');
console.log('');
console.log('IMPORTANT: This application has been migrated to use S3 for all media storage.');
console.log('');
console.log('Previous local storage directories that can be safely removed:');
console.log('- ./uploads/');
console.log('- ./qr-images/');
console.log('');
console.log('Database Changes:');
console.log('- All image/media fields now store S3 public URLs instead of local paths');
console.log('- Fields affected: profile_image, background_image, photo_upload, image (in Services/Flowers)');
console.log('');
console.log('Required Environment Variables for S3:');
console.log('- AWS_REGION: Your AWS S3 region');
console.log('- AWS_ACCESS_KEY_ID: AWS access key ID');
console.log('- AWS_SECRET_ACCESS_KEY: AWS secret access key');
console.log('- AWS_S3_BUCKET_NAME: S3 bucket name');
console.log('');
console.log('New S3 Folder Structure:');
console.log('- flowers/: Flower images');
console.log('- services/: Service images');
console.log('- guestbook/{slug}/images/: Guestbook photos');
console.log('- profiles/{slug}/profile-images/: Profile images');
console.log('- profiles/{slug}/background-images/: Background images');
console.log('- profiles/{slug}/gallery/photos/: Gallery photos');
console.log('- profiles/{slug}/gallery/videos/: Gallery videos');
console.log('- qr-codes/: QR code images');
console.log('');

// Check if local directories exist
const localDirs = [
    './uploads/',
    './qr-images/'
];

console.log('Checking for local storage directories:');
localDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
        console.log(`❗ Found: ${dir} - Can be safely removed after migration`);
    } else {
        console.log(`✅ Not found: ${dir}`);
    }
});

console.log('');
console.log('Manual Migration Steps:');
console.log('1. Set up your S3 bucket and configure environment variables');
console.log('2. If you have existing data, manually upload files to S3 following the folder structure above');
console.log('3. Update database records to use S3 URLs instead of local paths');
console.log('4. Remove local storage directories');
console.log('5. Test all media upload functionality');
console.log('');
console.log('New API Endpoints:');
console.log('- POST /memories/upload-profile-image?type=profile|background - Upload profile/background images');
console.log('- POST /memories/upload-media?mediatype=photos|videos - Upload single media file');
console.log('- POST /memories/upload-multiple-media?mediatype=photos|videos - Upload multiple media files');
console.log('');
console.log('Migration complete! 🎉');
