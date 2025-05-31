const { db } = require('../config/firebase');
const { handleResponse } = require('../utils/responseHandler');

exports.promoteUserToAdmin = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return handleResponse(res, 400, false, 'Email is required');
    }

    // Find user by email
    const userSnapshot = await db.collection('users').where('email', '==', email).get();
    if (userSnapshot.empty) {
      return handleResponse(res, 404, false, 'User not found');
    }

    const userDoc = userSnapshot.docs[0];
    const userRef = userDoc.ref;

    // Update isAdmin flag
    await userRef.update({ isAdmin: true });

    return handleResponse(res, 200, true, `User with email ${email} promoted to admin`);
  } catch (error) {
    console.error('Promote user to admin error:', error);
    return handleResponse(res, 500, false, 'Server error');
  }
};

exports.getUsers = async (req, res) => {
  try {
    const usersSnapshot = await db.collection('users').get();
    const users = usersSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        uid: doc.id,
        username: data.username,
        email: data.email,
        score: data.score || 0,
        completedChallenges: data.completedChallenges || [],
        isAdmin: data.isAdmin || false,
        teamId: data.teamId || null,
        teamName: data.teamName || null,
        role: data.role || null,
        disqualified: data.disqualified || false
      };
    });
    return handleResponse(res, 200, true, 'Users retrieved', { users });
  } catch (error) {
    console.error('Get users error:', error);
    return handleResponse(res, 500, false, 'Server error');
  }
};

// Add new user
exports.addUser = async (req, res) => {
  try {
    const { username, email, score, completedChallenges, isAdmin } = req.body;
    if (!username || !email) {
      return handleResponse(res, 400, false, 'Username and email are required');
    }
    const newUser = {
      username,
      email,
      score: score || 0,
      completedChallenges: completedChallenges || [],
      isAdmin: isAdmin || false,
      createdAt: new Date()
    };
    const userRef = await db.collection('users').add(newUser);
    return handleResponse(res, 201, true, 'User added', { id: userRef.id });
  } catch (error) {
    console.error('Add user error:', error);
    return handleResponse(res, 500, false, 'Server error');
  }
};

// Edit user
exports.editUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    if (!id) {
      return handleResponse(res, 400, false, 'User ID is required');
    }
    const userRef = db.collection('users').doc(id);
    await userRef.update(updateData);
    return handleResponse(res, 200, true, 'User updated');
  } catch (error) {
    console.error('Edit user error:', error);
    return handleResponse(res, 500, false, 'Server error');
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return handleResponse(res, 400, false, 'User ID is required');
    }
    const userRef = db.collection('users').doc(id);
    await userRef.delete();
    return handleResponse(res, 200, true, 'User deleted');
  } catch (error) {
    console.error('Delete user error:', error);
    return handleResponse(res, 500, false, 'Server error');
  }
};

exports.getSecurityLogs = async (req, res) => {
  try {
    const logsSnapshot = await db.collection('securityLogs').orderBy('timestamp', 'desc').limit(100).get();
    const logs = logsSnapshot.docs.map(doc => {
      const data = doc.data();
      const timestamp = data.timestamp.toDate().toISOString().replace('T', ' ').substring(0, 19);
      return `[${timestamp}] ${data.level.toUpperCase()}: ${data.message}`;
    });
    return handleResponse(res, 200, true, 'Security logs retrieved', { logs });
  } catch (error) {
    console.error('Get security logs error:', error);
    return handleResponse(res, 500, false, 'Server error');
  }
};
