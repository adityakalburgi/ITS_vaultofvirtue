const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const adminAuthMiddleware = require('../middleware/adminAuthMiddleware');

// Route to promote user to admin, protected by adminAuthMiddleware
router.post('/promote', adminAuthMiddleware, adminController.promoteUserToAdmin);

// Route to get all users, protected by adminAuthMiddleware
router.get('/users', adminAuthMiddleware, adminController.getUsers);

// Route to add new user
router.post('/users', adminAuthMiddleware, adminController.addUser);

// Route to edit user
router.put('/users/:id', adminAuthMiddleware, adminController.editUser);

// Route to delete user
router.delete('/users/:id', adminAuthMiddleware, adminController.deleteUser);

// Route to get security logs
router.get('/logs', adminAuthMiddleware, adminController.getSecurityLogs);

module.exports = router;
