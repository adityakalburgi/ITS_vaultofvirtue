const { db, admin } = require('../config/firebase');
const { handleResponse } = require('../utils/responseHandler');

/**
 * Get user leaderboard
 * Returns top users sorted by score
 */
exports.getUserLeaderboard = async (req, res) => {
  try {
    // Get query parameters for pagination
    const limit = parseInt(req.query.limit) || 50;
    const page = parseInt(req.query.page) || 1;
    const startAfter = req.query.startAfter || null;

    // Initialize query
    let query = db.collection('users')
      .orderBy('score', 'desc')
      .orderBy('username', 'asc'); // Secondary sort for users with same score

    // Apply cursor-based pagination if startAfter is provided
    if (startAfter) {
      const startAfterDoc = await db.collection('users').doc(startAfter).get();
      if (startAfterDoc.exists) {
        query = query.startAfter(startAfterDoc);
      }
    } else if (page > 1) {
      // Skip documents for page-based pagination
      query = query.offset((page - 1) * limit);
    }

    // Limit results
    query = query.limit(limit);

    // Execute query
    const snapshot = await query.get();
    
    // Transform data and add ranks
    const leaderboard = snapshot.docs.map((doc, index) => {
      const userData = doc.data();
      
      // Calculate rank (accounting for pagination)
      const rank = startAfter || page > 1 
        ? (page - 1) * limit + index + 1 
        : index + 1;
        
      return {
        id: doc.id,
        rank,
        username: userData.username,
        teamName: userData.teamName || null,
        score: userData.score || 0,
        completedChallenges: userData.completedChallenges 
          ? userData.completedChallenges.length 
          : 0
      };
    });

    // Get total count for pagination info
    const totalSnapshot = await db.collection('users').count().get();
    const total = totalSnapshot.data().count;
    
    return handleResponse(res, 200, true, 'Leaderboard retrieved successfully', {
      leaderboard,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
        hasMore: snapshot.docs.length === limit
      }
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return handleResponse(res, 500, false, 'Error fetching leaderboard');
  }
};

/**
 * Get team leaderboard
 * Returns teams sorted by cumulative score
 */
exports.getTeamLeaderboard = async (req, res) => {
  try {
    // Get all teams from teams collection
    const teamsSnapshot = await db.collection('teams').get();

    // Get all users
    const usersSnapshot = await db.collection('users').get();

    // Map to track team scores and members
    const teams = {};

    // Initialize teams from teams collection with 0 score and empty members
    teamsSnapshot.docs.forEach(doc => {
      const teamData = doc.data();
      teams[doc.id] = {
        id: doc.id,
        name: teamData.name,
        members: [],
        score: 0,
        completedChallenges: new Set()
      };
    });

    // Calculate team scores from user data
    usersSnapshot.docs.forEach(doc => {
      const userData = doc.data();

      // Skip users without teams
      if (!userData.teamId || !teams[userData.teamId]) return;

      // Add user to team members
      teams[userData.teamId].members.push({
        id: doc.id,
        username: userData.username,
        score: userData.score || 0
      });

      // Add user score to team score
      teams[userData.teamId].score += (userData.score || 0);

      // Add user's completed challenges to team's set
      if (userData.completedChallenges && userData.completedChallenges.length > 0) {
        userData.completedChallenges.forEach(challengeId => {
          teams[userData.teamId].completedChallenges.add(challengeId);
        });
      }
    });

    // Convert to array and prepare for response
    let teamLeaderboard = Object.values(teams).map(team => ({
      id: team.id,
      name: team.name,
      memberCount: team.members.length,
      score: team.score,
      completedChallenges: team.completedChallenges.size,
      avgScore: team.members.length > 0
        ? Math.round(team.score / team.members.length)
        : 0
    }));

    // Sort by team score (highest first)
    teamLeaderboard.sort((a, b) => b.score - a.score);

    // Add ranks
    teamLeaderboard = teamLeaderboard.map((team, index) => ({
      ...team,
      rank: index + 1
    }));

    return handleResponse(res, 200, true, 'Team leaderboard retrieved successfully', {
      teamLeaderboard
    });
  } catch (error) {
    console.error('Error fetching team leaderboard:', error);
    return handleResponse(res, 500, false, 'Error fetching team leaderboard');
  }
};

/**
 * Get team details by teamId
 */
exports.getTeamDetails = async (req, res) => {
  try {
    const { teamId } = req.params;
    console.log("getTeamDetails called with teamId:", teamId);
    if (!teamId) {
      return handleResponse(res, 400, false, 'Team ID is required');
    }

    // Get all users in the team
    const usersSnapshot = await db.collection('users')
      .where('teamId', '==', teamId)
      .get();

    console.log("Users found for teamId:", usersSnapshot.size);

    if (usersSnapshot.empty) {
      return handleResponse(res, 404, false, 'Team not found or has no members');
    }

    const members = usersSnapshot.docs.map(doc => {
      const userData = doc.data();
      return {
        id: doc.id,
        username: userData.username,
        email: userData.email,
        role: userData.role || 'member'
      };
    });

    // Get team name from first member (assuming all have same teamName)
    const teamName = members[0]?.teamName || null;

    return handleResponse(res, 200, true, 'Team details retrieved successfully', {
      teamId,
      teamName,
      memberCount: members.length,
      members,
      score
    });
  } catch (error) {
    console.error('Error fetching team details:', error);
    return handleResponse(res, 500, false, 'Error fetching team details');
  }
};

/**
 * Get challenge-specific leaderboard
 * Shows which users completed a specific challenge fastest
 */
exports.getChallengeLeaderboard = async (req, res) => {
  try {
    const { challengeId } = req.params;
    
    // Verify challenge exists
    const challengeDoc = await db.collection('challenges').doc(challengeId).get();
    if (!challengeDoc.exists) {
      return handleResponse(res, 404, false, 'Challenge not found');
    }
    
    // Get all successful attempts for this challenge
    const attemptsSnapshot = await db.collection('attempts')
      .where('challengeId', '==', challengeId)
      .where('success', '==', true)
      .orderBy('timestamp', 'asc')
      .get();
    
    // Track first completion by each user
    const userFirstAttempts = new Map();
    
    attemptsSnapshot.docs.forEach(doc => {
      const attempt = doc.data();
      
      // Only keep the first successful attempt per user
      if (!userFirstAttempts.has(attempt.userId)) {
        userFirstAttempts.set(attempt.userId, {
          userId: attempt.userId,
          username: attempt.username,
          timestamp: attempt.timestamp.toDate(),
          formattedTime: attempt.timestamp.toDate().toISOString()
        });
      }
    });
    
    // Convert to array and add ranks
    const leaderboard = Array.from(userFirstAttempts.values())
      .map((entry, index) => ({
        ...entry,
        rank: index + 1
      }));
    
    return handleResponse(res, 200, true, 'Challenge leaderboard retrieved successfully', {
      challengeId,
      challengeName: challengeDoc.data().title,
      leaderboard
    });
  } catch (error) {
    console.error('Error fetching challenge leaderboard:', error);
    return handleResponse(res, 500, false, 'Error fetching challenge leaderboard');
  }
};

/**
 * Get current user's rank and stats
 */
exports.getUserRanking = async (req, res) => {
  try {
    const { uid } = req.user;
    
    // Get user data
    const userDoc = await db.collection('users').doc(uid).get();
    if (!userDoc.exists) {
      return handleResponse(res, 404, false, 'User not found');
    }
    
    const userData = userDoc.data();
    const userScore = userData.score || 0;
    
    // Count users with higher score
    const higherScoreSnapshot = await db.collection('users')
      .where('score', '>', userScore)
      .count()
      .get();
    
    const usersAhead = higherScoreSnapshot.data().count;
    const userRank = usersAhead + 1; // Rank is count of users ahead + 1
    
    // Get total user count for percentile
    const totalUsersSnapshot = await db.collection('users')
      .count()
      .get();
    
    const totalUsers = totalUsersSnapshot.data().count;
    
    // Calculate percentile (higher is better)
    const percentile = totalUsers > 1 
      ? Math.round(((totalUsers - userRank) / (totalUsers - 1)) * 100) 
      : 100;
    
    return handleResponse(res, 200, true, 'User ranking retrieved successfully', {
      username: userData.username,
      score: userScore,
      rank: userRank,
      totalUsers,
      percentile,
      completedChallenges: userData.completedChallenges ? userData.completedChallenges.length : 0
    });
  } catch (error) {
    console.error('Error fetching user ranking:', error);
    return handleResponse(res, 500, false, 'Error fetching user ranking');
  }
};
