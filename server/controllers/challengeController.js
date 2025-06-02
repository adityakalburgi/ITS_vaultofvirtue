const { db, admin } = require('../config/firebase');
const { handleResponse } = require('../utils/responseHandler');
const { isSessionExpired } = require('../utils/sessionManager');

// Get all challenges
exports.getChallenges = async (req, res) => {
  try {
    const challengesSnapshot = await db.collection('challenges')
      .orderBy('difficulty')
      .orderBy('points')
      .get();
    
    const challenges = challengesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // Don't expose solutions in the response
      solution: undefined
    }));
    
    return handleResponse(res, 200, true, 'Challenges retrieved', { challenges });
  } catch (error) {
    console.error('Get challenges error:', error);
    return handleResponse(res, 500, false, 'Server error');
  }
};

// Get challenge by ID
exports.getChallengeById = async (req, res) => {
  try {
    const { id } = req.params;
    const challengeDoc = await db.collection('challenges').doc(id).get();
    
    if (!challengeDoc.exists) {
      return handleResponse(res, 404, false, 'Challenge not found');
    }
    
    const challengeData = challengeDoc.data();
    
    const challenge = {
      id: challengeDoc.id,
      ...challengeData,
      // Don't expose solution in the response
      solution: undefined
    };
    
    return handleResponse(res, 200, true, 'Challenge retrieved', { challenge });
  } catch (error) {
    console.error('Get challenge error:', error);
    return handleResponse(res, 500, false, 'Server error');
  }
};

// Submit challenge solution
exports.submitSolution = async (req, res) => {
  console.log(`submitSolution called for user ${req.user.uid}`);
  try {
    const { challengeId, solution } = req.body;
    
    // Validate inputs
    if (!challengeId || !solution) {
      return handleResponse(res, 400, false, 'Challenge ID and solution are required');
    }
    
    // Get user
    const userDoc = await db.collection('users').doc(req.user.uid).get();
    if (!userDoc.exists) {
      return handleResponse(res, 404, false, 'User not found');
    }
    
    const userData = userDoc.data();
    
    // Check if session is expired
    if (isSessionExpired(userData.sessionExpiry)) {
      return handleResponse(res, 403, false, 'Challenge session expired');
    }
    
    // Check if user already completed this challenge
    if (userData.completedChallenges && userData.completedChallenges.includes(challengeId)) {
      return handleResponse(res, 400, false, 'Challenge already completed');
    }
    
    // Get challenge
    const challengeDoc = await db.collection('challenges').doc(challengeId).get();
    if (!challengeDoc.exists) {
      return handleResponse(res, 404, false, 'Challenge not found');
    }
    
    const challenge = challengeDoc.data();
    
    // Verify solution (case insensitive comparison)
    try{ 
      if (solution.trim().toLowerCase() !== challenge.solution.trim().toLowerCase()) {
        // Log failed attempt
        await db.collection('attempts').add({
          userId: req.user.uid,
          username: userData.username,
          challengeId,
          challengeTitle: challenge.title,
          solution: solution,
          success: false,
          timestamp: admin.firestore.FieldValue.serverTimestamp()
        });
        
        // Log security event
        await db.collection('securityLogs').add({
          type: 'FAILED_SOLUTION',
          userId: req.user.uid,
          challengeId,
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
          details: `Failed solution attempt for challenge: ${challenge.title}`
        });
        throw new Error("Incorrect Solution");        
      }}
    catch (err) {
        return res.status(400).json({ success: false, message: err.message });
    }
    
    // Solution is correct, update user data in a transaction for consistency
    await db.runTransaction(async (transaction) => {
      // Get fresh user data within transaction
      const userRef = db.collection('users').doc(req.user.uid);
      const userSnapshot = await transaction.get(userRef);
      const user = userSnapshot.data();

      console.log("User data inside transaction before update:", user);
      
      // Make sure they haven't completed the challenge in the meantime
      if (user.completedChallenges && user.completedChallenges.includes(challengeId)) {
        throw new Error('Challenge already completed');
      }
      
      // Initialize completedChallenges if undefined
      const currentCompletedChallenges = user.completedChallenges || [];
      
      // Update user's completed challenges and score
      const updatedCompletedChallenges = [...currentCompletedChallenges, challengeId];
      const updatedScore = (user.score || 0) + challenge.points;

      console.log(`Updating user ${req.user.uid} score from ${user.score} to ${updatedScore}`);
      console.log(`Updating completedChallenges to:`, updatedCompletedChallenges);

      // Update team score in teams collection
      if (user.teamId) {
        const teamRef = db.collection('teams').doc(user.teamId);
        const teamSnapshot = await transaction.get(teamRef);
        if (teamSnapshot.exists) {
          const teamData = teamSnapshot.data();
          const updatedTeamScore = (teamData.score || 0) + challenge.points;
          console.log(`Updating team ${user.teamId} score from ${teamData.score} to ${updatedTeamScore}`);
          transaction.update(teamRef, { score: updatedTeamScore });
        } else {
          console.warn(`Team document for ${user.teamId} does not exist.`);
        }
      } else {
        console.warn(`User ${req.user.uid} does not have a teamId.`);
      }
      
      transaction.update(userRef, {
        completedChallenges: updatedCompletedChallenges,
        score: updatedScore
      });
      
      // Log successful attempt
      const attemptRef = db.collection('attempts').doc();
      transaction.set(attemptRef, {
        userId: req.user.uid,
        username: user.username,
        challengeId,
        challengeTitle: challenge.title,
        solution,
        success: true,
        pointsEarned: challenge.points,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });
      
      // Log security event
      const logRef = db.collection('securityLogs').doc();
      transaction.set(logRef, {
        type: 'SUCCESSFUL_SOLUTION',
        userId: req.user.uid,
        challengeId,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        details: `Successfully completed challenge: ${challenge.title}`
      });
    });
    
    // Get updated user data for response
    const updatedUserDoc = await db.collection('users').doc(req.user.uid).get();
    const updatedUserData = updatedUserDoc.data();
    
    console.log(`Updated user score for ${req.user.uid}: ${updatedUserData.score}`);
    
    return handleResponse(res, 200, true, 'Challenge completed successfully', {
      points: challenge.points,
      totalScore: updatedUserData.score,
      completedChallenges: updatedUserData.completedChallenges,
      notification: `Congratulations! You have completed the challenge "${challenge.title}" and earned ${challenge.points} points. Your team leaderboard will be updated accordingly.`
    });
  } catch (error) {
    console.error('Submit solution error:', error);
    
    if (error.message === 'Challenge already completed') {
      return handleResponse(res, 400, false, 'Challenge already completed');
    }
    
    return handleResponse(res, 500, false, 'Server error');
  }
};

// Get user's completed challenges
exports.getUserCompletedChallenges = async (req, res) => {
  try {
    const userDoc = await db.collection('users').doc(req.user.uid).get();
    
    if (!userDoc.exists) {
      return handleResponse(res, 404, false, 'User not found');
    }
    
    const userData = userDoc.data();
    const completedChallenges = userData.completedChallenges || [];
    
    return handleResponse(res, 200, true, 'Completed challenges retrieved', { completedChallenges });
  } catch (error) {
    console.error('Get completed challenges error:', error);
    return handleResponse(res, 500, false, 'Server error');
  }
};

// Get challenge hint
exports.getChallengeHint = async (req, res) => {
  try {
    const { challengeId, hintIndex } = req.params;
    
    // Validate input
    const index = parseInt(hintIndex);
    if (isNaN(index)) {
      return handleResponse(res, 400, false, 'Invalid hint index');
    }
    
    // Get challenge
    const challengeDoc = await db.collection('challenges').doc(challengeId).get();
    if (!challengeDoc.exists) {
      return handleResponse(res, 404, false, 'Challenge not found');
    }
    
    const challenge = challengeDoc.data();
    
    // Check if hint exists
    if (!challenge.hints || !challenge.hints[index]) {
      return handleResponse(res, 404, false, 'Hint not found');
    }
    
    // Log hint request
    await db.collection('securityLogs').add({
      type: 'HINT_REQUESTED',
      userId: req.user.uid,
      challengeId,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      details: `Requested hint #${index + 1} for challenge: ${challenge.title}`
    });
    
    return handleResponse(res, 200, true, 'Hint retrieved', { 
      hint: challenge.hints[index] 
    });
  } catch (error) {
    console.error('Get hint error:', error);
    return handleResponse(res, 500, false, 'Server error');
  }
};

// Get user progress summary
exports.getUserProgress = async (req, res) => {
  try {
    const userDoc = await db.collection('users').doc(req.user.uid).get();
    
    if (!userDoc.exists) {
      return handleResponse(res, 404, false, 'User not found');
    }
    
    const userData = userDoc.data();
    
    // Get total challenges count
    const challengesSnapshot = await db.collection('challenges').get();
    const totalChallenges = challengesSnapshot.size;
    
    // Calculate completion percentage
    const completedCount = userData.completedChallenges ? userData.completedChallenges.length : 0;
    const completionPercentage = totalChallenges > 0 
      ? Math.round((completedCount / totalChallenges) * 100) 
      : 0;
    
    // Get session info
    const sessionExpiry = userData.sessionExpiry 
      ? userData.sessionExpiry.toDate().toISOString() 
      : null;
    
    const sessionActive = userData.sessionExpiry 
      ? !isSessionExpired(userData.sessionExpiry) 
      : false;
    
    // Calculate time remaining if session is active
    let timeRemaining = null;
    if (sessionActive && userData.sessionExpiry) {
      const now = new Date();
      const expiry = userData.sessionExpiry.toDate();
      timeRemaining = Math.max(0, Math.floor((expiry - now) / 1000)); // in seconds
    }
    
    return handleResponse(res, 200, true, 'User progress retrieved', {
      score: userData.score || 0,
      completedChallenges: completedCount,
      totalChallenges,
      completionPercentage,
      sessionExpiry,
      sessionActive,
      timeRemaining,
      tabSwitchCount: userData.tabSwitchCount || 0
    });
  } catch (error) {
    console.error('Get user progress error:', error);
    return handleResponse(res, 500, false, 'Server error');
  }
};

// Get challenge leaderboard (top performers for a specific challenge)
exports.getChallengeLeaderboard = async (req, res) => {
  try {
    const { challengeId } = req.params;
    
    // Get challenge
    const challengeDoc = await db.collection('challenges').doc(challengeId).get();
    if (!challengeDoc.exists) {
      return handleResponse(res, 404, false, 'Challenge not found');
    }
    
    // Get successful attempts for this challenge, ordered by timestamp
    const attemptsSnapshot = await db.collection('attempts')
      .where('challengeId', '==', challengeId)
      .where('success', '==', true)
      .orderBy('timestamp', 'asc')
      .get();
    
    // Create a map to track first completion by each user
    const userFirstCompletions = new Map();
    
    attemptsSnapshot.docs.forEach(doc => {
      const attempt = doc.data();
      if (!userFirstCompletions.has(attempt.userId)) {
        userFirstCompletions.set(attempt.userId, {
          userId: attempt.userId,
          username: attempt.username,
          timestamp: attempt.timestamp.toDate()
        });
      }
    });
    
    // Convert to array and sort by timestamp
    const leaderboard = Array.from(userFirstCompletions.values())
      .sort((a, b) => a.timestamp - b.timestamp)
      .map((entry, index) => ({
        ...entry,
        rank: index + 1
      }));
    
    return handleResponse(res, 200, true, 'Challenge leaderboard retrieved', { leaderboard });
  } catch (error) {
    console.error('Get challenge leaderboard error:', error);
    return handleResponse(res, 500, false, 'Server error');
  }
};
