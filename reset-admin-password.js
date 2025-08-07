// Script to reset password for admin user
const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');

// Create Supabase client
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function resetPassword() {
  try {
    // New password to set
    const newPassword = 'Admin@123';
    
    // Hash the password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    console.log('New hashed password:', hashedPassword);
    
    // Update the user's password in the database using RPC function
    const { data, error } = await supabase.rpc('reset_user_password', {
      p_email: 'testadmin@example.com',
      p_user_type: 'admin',
      p_password_hash: hashedPassword
    });
    
    if (error) {
      console.error('Error updating password:', error);
      return;
    }
    
    console.log('Password reset successful for testadmin@example.com');
    console.log('New password is:', newPassword);
  } catch (error) {
    console.error('Password reset failed:', error);
  }
}

resetPassword();