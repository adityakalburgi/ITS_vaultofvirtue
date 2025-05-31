const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db, auth, admin } = require('../config/firebase');
const { handleResponse } = require('../utils/responseHandler');
const { calculateSessionExpiry } = require('../utils/sessionManager');

exports.register = async (req, res) => {
  try {
    const { username, email, password, teamName, registrationType } = req.body;

    // Check if email already exists
    const userSnapshot = await db.collection('users')
      .where('email', '==', email)
      .get();
    
    if (!userSnapshot.empty) {
      return handleResponse(res, 400, false, 'Email already in use');
    }

    // Create user in Firebase Auth
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: username
    });

    let teamRef;
    let teamId;

    // Transaction to handle team creation/joining
    await db.runTransaction(async (transaction) => {
      let teamData;

      if (registrationType === 'create') {
        // Check if team name already exists
        const teamSnapshot = await transaction.get(
          db.collection('teams').where('name', '==', teamName)
        );
        
        if (!teamSnapshot.empty) {
          throw new Error('Team name already exists');
        }

        // Create new team
        teamRef = db.collection('teams').doc();
        teamId = teamRef.id;
        teamData = {
          name: teamName,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          members: [{ uid: userRecord.uid, username, email, role: 'leader' }],
          creatorId: userRecord.uid
        };
        transaction.set(teamRef, teamData);
      } else {
        // Join existing team
        const teamSnapshot = await transaction.get(
          db.collection('teams').where('name', '==', teamName)
        );
        
        if (teamSnapshot.empty) {
          throw new Error('Team not found');
        }
        
        teamRef = teamSnapshot.docs[0].ref;
        teamId = teamRef.id;
        teamData = teamSnapshot.docs[0].data();
        
        // Add user to team members
        const updatedMembers = [...teamData.members, { uid: userRecord.uid, username, email, role: 'member' }];
        transaction.update(teamRef, { members: updatedMembers });
      }

      // Hash password and create user document with passwordHash
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      const userRef = db.collection('users').doc(userRecord.uid);
      transaction.set(userRef, {
        uid: userRecord.uid,
        username,
        email,
        passwordHash,
        teamId: teamId,
        teamName,
        role: registrationType === 'create' ? 'leader' : 'member',
        isAdmin: false,
        score: 0,
        completedChallenges: [],
        sessionExpiry: null,
        tabSwitchCount: 0,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    });

    // Check if teamRef is defined before accessing its id
    if (!teamRef) {
      throw new Error('Team reference is not defined');
    }

    // Generate JWT token
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET environment variable is not set');
    }
    const token = jwt.sign(
      { uid: userRecord.uid, email, username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return handleResponse(res, 201, true, 'Registration successful', { token, user: {
      uid: userRecord.uid,
      username,
      email,
      teamId: teamId,
      teamName,
      role: registrationType === 'create' ? 'leader' : 'member',
      isAdmin: false,
      disqualified: false,
      score: 0,
      completedChallenges: [],
      sessionExpiry: null
    } });
  } catch (error) {
    console.error('Registration error:', error);
    return handleResponse(res, 400, false, error.message);
  }
};

exports.login = async (req, res) => {
  try {
    let { email, teamName } = req.body;

    email = email.toLowerCase();
    teamName = teamName.toLowerCase();

    console.log(`Login attempt with email: ${email}, teamName: ${teamName}`);

    // Find user in Firestore by email and teamName
    const userSnapshot = await db.collection('users')
      .where('email', '==', email)
      .where('teamName', '==', teamName)
      .get();

    console.log(`User query returned ${userSnapshot.size} documents`);

    if (userSnapshot.empty) {
      console.log('No user found matching email and teamName');
      return handleResponse(res, 401, false, 'Invalid credentials');
    }

    const userDoc = userSnapshot.docs[0];
    const userData = userDoc.data();

    // Start a new challenge session only if sessionExpiry is not set or expired
    const now = admin.firestore.Timestamp.now();
    const currentExpiry = userData.sessionExpiry;
    let sessionExpiry = currentExpiry;

    if (!currentExpiry || currentExpiry.toMillis() < now.toMillis()) {
      sessionExpiry = calculateSessionExpiry();
    }

    await db.collection('users').doc(userDoc.id).update({
      sessionExpiry,
      tabSwitchCount: 0,
      lastLogin: admin.firestore.FieldValue.serverTimestamp()
    });

    // Generate JWT token
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET environment variable is not set');
    }
    const token = jwt.sign(
      {
        uid: userDoc.id,
        email: userData.email,
        username: userData.username,
        isAdmin: userData.isAdmin || false
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return handleResponse(res, 200, true, 'Login successful', {
      token,
      user: {
        uid: userDoc.id,
        username: userData.username,
        email: userData.email,
        teamId: userData.teamId,
        teamName: userData.teamName,
        role: userData.role,
        isAdmin: userData.isAdmin || false,
        disqualified: userData.disqualified || false,
        sessionExpiry
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return handleResponse(res, 500, false, 'Server error');
  }
};

// Admin login
exports.loginAsAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("Admin login attempt for email:", email);

    // Find user by email in Firestore
    const userSnapshot = await db.collection('users').where('email', '==', email).get();
    if (userSnapshot.empty) {
      console.log("Admin login failed: User not found in Firestore");
      return handleResponse(res, 404, false, 'User not found');
    }

    const userDoc = userSnapshot.docs[0];
    const userData = userDoc.data();

    // Check if user is admin
    if (!userData.isAdmin) {
      console.log("Admin login failed: User is not admin");
      return handleResponse(res, 403, false, 'Not authorized as admin');
    }

    // Get Firebase Auth user by UID
    const userRecord = await auth.getUser(userDoc.id);

    // Verify password manually using bcrypt
    // Note: Password hash must be stored in Firestore for this to work
    if (!userData.passwordHash) {
      console.log("Admin login failed: Password hash missing");
      return handleResponse(res, 401, false, 'Password not set for admin user. Please reset password.');
    }

    const isPasswordValid = await bcrypt.compare(password, userData.passwordHash);
    if (!isPasswordValid) {
      console.log("Admin login failed: Invalid password");
      return handleResponse(res, 401, false, 'Invalid credentials');
    }

    // Generate JWT token
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET environment variable is not set');
    }
    const token = jwt.sign(
      {
        uid: userDoc.id,
        email: userData.email,
        username: userData.username,
        isAdmin: true
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log("Admin login successful for user:", userData.username);
    console.log("Admin login response user object:", {
      uid: userDoc.id,
      username: userData.username,
      email: userData.email,
      isAdmin: true,
      disqualified: userData.disqualified || false
    });

    return handleResponse(res, 200, true, 'Admin login successful', {
      token,
      user: {
        uid: userDoc.id,
        username: userData.username,
        email: userData.email,
        isAdmin: true,
        disqualified: userData.disqualified || false
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    return handleResponse(res, 500, false, 'Server error');
  }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    const userDoc = await db.collection('users').doc(req.user.uid).get();
    
    if (!userDoc.exists) {
      return handleResponse(res, 404, false, 'User not found');
    }

    const userData = userDoc.data();
    
    return handleResponse(res, 200, true, 'User retrieved', {
      user: {
        uid: req.user.uid,
        username: userData.username,
        email: userData.email,
        teamId: userData.teamId,
        teamName: userData.teamName,
        role: userData.role,
        isAdmin: userData.isAdmin || false,
        sessionExpiry: userData.sessionExpiry,
        completedChallenges: userData.completedChallenges || [],
        score: userData.score || 0
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    return handleResponse(res, 500, false, 'Server error');
  }
};

// Track tab switch
exports.trackTabSwitch = async (req, res) => {
  try {
    const userRef = db.collection('users').doc(req.user.uid);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      return handleResponse(res, 404, false, 'User not found');
    }
    
    const userData = userDoc.data();
    const currentCount = userData.tabSwitchCount || 0;
    const maxSwitches = 3; // Set your maximum allowed switches
    
    // Increment tab switch count
    await userRef.update({
      tabSwitchCount: currentCount + 1
    });
    
    const isExceeded = (currentCount + 1) >= maxSwitches;
    
    // If exceeds max, terminate session
    if (isExceeded) {
      await userRef.update({
        sessionExpiry: admin.firestore.FieldValue.serverTimestamp()
      });
    }
    
    return handleResponse(res, 200, true, 'Tab switch recorded', {
      tabSwitchCount: currentCount + 1,
      isSessionTerminated: isExceeded
    });
  } catch (error) {
    console.error('Track tab switch error:', error);
    return handleResponse(res, 500, false, 'Server error');
  }
};
