-- Initialize MySQL database for Magnolia Touch Backend
-- This script runs when the MySQL container starts for the first time

-- Set timezone to UTC
SET time_zone = '+00:00';

-- Create additional databases if needed
-- Note: The main database is created via MYSQL_DATABASE environment variable
-- CREATE DATABASE IF NOT EXISTS magnolia_test;

-- Optimize MySQL settings for better performance
-- These settings are applied at the session level for this initialization

-- Create a read-only user for monitoring/analytics (optional)
-- CREATE USER IF NOT EXISTS 'readonly_user'@'%' IDENTIFIED BY 'readonly_password';
-- GRANT SELECT ON magnolia_db.* TO 'readonly_user'@'%';
-- FLUSH PRIVILEGES;

-- Performance optimizations will be handled in my.cnf

-- Log successful initialization
SELECT 'Magnolia Touch Backend MySQL database initialized successfully' AS message;
