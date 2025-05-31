const bcrypt = require('bcryptjs');
const { db } = require('../config/firebase');

async function resetAdminPassword(email, newPassword) {
  try {
    // Find user by email
    const userSnapshot = await db.collection('users').where('email', '==', email).get();
    if (userSnapshot.empty) {
      console.log('User not found with email:', email);
      return;
    }

    const userDoc = userSnapshot.docs[0];
    const userId = userDoc.id;

    // Hash new password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update user document with passwordHash
    await db.collection('users').doc(userId).update({ passwordHash });

    console.log(`Password hash updated for user ${email}`);
  } catch (error) {
    console.error('Error resetting admin password:', error);
  }
}

// Example usage:
// resetAdminPassword('admin@example.com', 'newSecurePassword');

module.exports = resetAdminPassword;
