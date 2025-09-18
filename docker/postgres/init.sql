-- Initialize PostgreSQL database for Magnolia Touch Backend
-- This script runs when the postgres container starts for the first time

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create additional databases if needed
-- Note: The main database is created via POSTGRES_DB environment variable
-- CREATE DATABASE magnolia_test;

-- Create indexes for performance (these will be applied after Prisma migrations)
-- Note: Actual indexes should be defined in Prisma schema
-- These are just examples of what might be needed

-- Performance optimizations
-- Set some database-level configurations
ALTER DATABASE magnolia_db SET timezone TO 'UTC';

-- Create a read-only user for monitoring/analytics (optional)
-- CREATE USER readonly_user WITH PASSWORD 'readonly_password';
-- GRANT CONNECT ON DATABASE magnolia_db TO readonly_user;
-- GRANT USAGE ON SCHEMA public TO readonly_user;
-- GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly_user;
-- ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO readonly_user;

-- Log successful initialization
DO $$
BEGIN
    RAISE NOTICE 'Magnolia Touch Backend database initialized successfully';
END $$;
