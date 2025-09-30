const nodemailer = require('nodemailer');
require('dotenv').config();

async function testEmailConnection() {
  console.log('Testing Gmail SMTP connection...');
  console.log('MAIL_USER:', process.env.MAIL_USER);
  console.log('MAIL_PASS:', process.env.MAIL_PASS ? '***' + process.env.MAIL_PASS.slice(-4) : 'NOT SET');

  // Create transporter
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
    debug: true, // Enable debug output
    logger: true, // Log to console
  });

  try {
    // Test the connection
    console.log('Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection successful!');

    // Try sending a test email
    console.log('Sending test email...');
    const result = await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: process.env.MAIL_USER, // Send to self for testing
      subject: 'Test Email from Magnolia Touch Backend',
      text: 'This is a test email to verify SMTP configuration.',
      html: '<h1>Test Email</h1><p>This is a test email to verify SMTP configuration.</p>',
    });

    console.log('✅ Test email sent successfully!');
    console.log('Message ID:', result.messageId);

  } catch (error) {
    console.log('❌ SMTP connection failed:');
    console.error('Error details:', error);
    
    if (error.code === 'EAUTH') {
      console.log('\n🔧 Authentication failed. Please check:');
      console.log('1. Gmail 2FA is enabled');
      console.log('2. App password is correctly generated');
      console.log('3. MAIL_USER and MAIL_PASS are correct in .env file');
    }
  }
}

testEmailConnection();