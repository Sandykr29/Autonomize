const express = require('express');
const {
    saveUser,
    findMutualFriends,
    searchUsers,
    softDeleteUser,
    updateUser,
    listUsers
} = require('../controllers/userController');

const router = express.Router();

router.get('/save/:username', saveUser);
router.get('/mutual-friends/:username', findMutualFriends);
router.get('/search', searchUsers);
router.delete('/soft-delete/:id', softDeleteUser);
router.patch('/update/:id', updateUser);
router.get('/list', listUsers);

module.exports = router;
