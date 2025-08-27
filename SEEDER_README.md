# Database Seeder for Magnolia Touch Backend

This seeder file populates your database with comprehensive sample data for development and testing purposes.

## What's Included

The seeder creates the following data:

### 🧑‍💼 Users (3)
- **Admin User**: `admin@magnolia.com` / `admin123`
- **Test User**: `john.doe@example.com` / `password123`  
- **Delivery Agent**: `delivery@magnolia.com` / `delivery123`

### 🏺 Memorial Profiles (2)
- **John Smith**: Complete memorial with biography, family, gallery, and guestbook
- **Mary Johnson**: Basic memorial setup

### 📦 Products & Services
- **Products**: 4 memorial-related items (candles, stones, frames, wind chimes)
- **Flowers**: 4 flower arrangements for memorials
- **Services**: 3 cleaning and maintenance services

### 🏢 Business Data
- **Churches**: 2 sample churches/cemeteries
- **Subscription Plans**: 3 different service tiers
- **Bookings**: 1 sample booking
- **Orders**: 1 sample order with items
- **Cart**: Shopping cart with sample items

### 📍 Address Data
- User shipping and billing addresses
- Church locations

## Prerequisites

Make sure you have the following installed:
- Node.js (v16 or higher)
- TypeScript (`npm install -g typescript`)
- ts-node (`npm install -g ts-node`)

## Installation & Usage

### 1. Add Seed Script to package.json

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "seed": "npx ts-node prisma/seed.ts",
    "seed:reset": "npx prisma db push --force-reset && npm run seed"
  }
}
```

### 2. Install Dependencies

The seeder requires `bcrypt` for password hashing:

```bash
npm install bcrypt
npm install --save-dev @types/bcrypt
```

### 3. Run the Seeder

#### Option A: Seed existing database
```bash
npm run seed
```

#### Option B: Reset database and seed (⚠️ **This will delete all existing data**)
```bash
npm run seed:reset
```

#### Option C: Direct execution
```bash
npx ts-node prisma/seed.ts
```

## What the Seeder Creates

### Memorial Profiles
- **John Smith Memorial**: Complete profile with:
  - Biography with life story
  - Family members (spouse, children)
  - Photo gallery (2 sample photos)
  - Approved guestbook entries (2 entries)
  - Unique memorial code for QR access

- **Mary Johnson Memorial**: Basic profile setup ready for customization

### Sample Business Flow
1. **User Registration**: Test user account ready to use
2. **Memorial Creation**: Pre-built memorials to test features
3. **Product Shopping**: Cart with items ready for checkout
4. **Service Booking**: Cleaning service booking example
5. **Order Processing**: Sample order for testing fulfillment

### Testing Accounts

| Role | Email | Password | Purpose |
|------|--------|----------|---------|
| Admin | admin@magnolia.com | admin123 | Admin panel access, user management |
| User | john.doe@example.com | password123 | Customer experience testing |
| Delivery | delivery@magnolia.com | delivery123 | Delivery agent features |

## Memorial Access Codes

After seeding, check the console output for the generated memorial codes. These codes are used to access memorial profiles via QR codes or direct links.

Example URL format: `https://your-domain.com/memorial?code=ABC12-DEF34-GH567`

## Important Notes

### ⚠️ Development Only
This seeder is intended for development and testing environments only. Do not run this in production.

### 🔄 Re-running the Seeder
- The seeder uses `upsert` for users to prevent duplicates
- Other entities will be created as new records each time
- Use `seed:reset` to completely clean and re-seed

### 🌐 S3 URLs
All image URLs in the seeder are examples (`https://example-bucket.s3.amazonaws.com/...`). Replace these with your actual S3 bucket URLs or use local file paths during development.

### 🔒 Password Security
All passwords are properly hashed using bcrypt with a salt rounds of 10.

## Customization

You can modify the seeder to add more data or change existing data:

1. **Add more users**: Extend the user creation section
2. **Create more memorials**: Follow the existing memorial creation pattern
3. **Add products**: Extend the products array
4. **Modify sample data**: Update any of the data objects to match your needs

## Troubleshooting

### Common Issues

**Error: "Cannot find module '@prisma/client'"**
```bash
npx prisma generate
```

**Error: "bcrypt not found"**
```bash
npm install bcrypt @types/bcrypt
```

**Error: "Database connection failed"**
- Check your database connection string in `.env`
- Ensure your database server is running
- Run `npx prisma db push` to sync your schema

**Error: "Table doesn't exist"**
```bash
npx prisma db push
```

## Data Verification

After seeding, you can verify the data was created correctly:

```bash
# Connect to your database and check record counts
# For PostgreSQL:
psql your_database_url -c "SELECT 'users' as table_name, COUNT(*) FROM \"User\" UNION ALL SELECT 'memorials', COUNT(*) FROM \"DeadPersonProfile\" UNION ALL SELECT 'products', COUNT(*) FROM \"Products\";"

# For MySQL:
mysql -u username -p database_name -e "SELECT 'users' as table_name, COUNT(*) FROM User UNION ALL SELECT 'memorials', COUNT(*) FROM DeadPersonProfile UNION ALL SELECT 'products', COUNT(*) FROM Products;"
```

## Support

If you encounter any issues with the seeder:

1. Check the console output for detailed error messages
2. Verify your Prisma schema matches the seeder expectations
3. Ensure all required dependencies are installed
4. Check your database connection and permissions

The seeder provides detailed console output showing exactly what data was created, including login credentials and memorial access codes.
