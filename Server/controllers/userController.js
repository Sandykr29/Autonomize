const User = require('../models/userModel');
const { fetchGitHubUser } = require('../utils/githubAPI');

// Save user or return if already exists
const saveUser = async (req, res) => {
    const { username } = req.params;
    try {
        let user = await User.findOne({ username, isDeleted: false });
        if (user) return res.status(200).json(user);

        const gitHubData = await fetchGitHubUser(username);
        user = new User({ ...gitHubData, username });
        await user.save();
        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Find mutual friends
const findMutualFriends = async (req, res) => {
    const { username } = req.params;
    try {
        const user = await User.findOne({ username, isDeleted: false });
        if (!user) return res.status(404).json({ error: "User not found" });

        const following = await User.find({ username: { $in: user.following } });
        const followers = await User.find({ username: { $in: user.followers } });

        const mutuals = following.filter(f => followers.some(fl => fl.username === f.username));
        user.friends = mutuals.map(m => m._id);
        await user.save();

        res.status(200).json(mutuals);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Search users based on text index
const searchUsers = async (req, res) => {
    const { query } = req.query;
    try {
        const users = await User.find({ 
            $text: { $search: query },
            isDeleted: false,
        });
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Soft delete a user (check if user exists first)
const softDeleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await User.findOne({ _id: id, isDeleted: false });
        if (!user) {
            return res.status(404).json({ error: 'User not found or is deleted' });
        }
        const updatedUser = await User.findOneAndUpdate({ _id:id, isDeleted: false },{ isDeleted: true },{ new: true } );

        res.status(200).json({ message: "User soft deleted", user: updatedUser });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// Update user details
const updateUser = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await User.findOne({ _id: id, isDeleted: false });
        if (!user) {
            return res.status(404).json({ error: 'User not found or is deleted' });
        }
        const updatedUser = await User.findOneAndUpdate({ _id: id, isDeleted: false },req.body,{ new: true, runValidators: true });
        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// List users and sort based on query
const listUsers = async (req, res) => {
    const { sortBy } = req.query;
    try {
        const users = await User.find({ isDeleted: false }).sort({ [sortBy]: 1 });
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    saveUser,
    findMutualFriends,
    searchUsers,
    softDeleteUser,
    updateUser,
    listUsers
};
