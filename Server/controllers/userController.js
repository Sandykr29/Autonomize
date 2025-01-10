const User = require('../models/userModel');
const { fetchGitHubUser } = require('../utils/githubAPI');

// Save user or return if already exists
const saveUser = async (req, res) => {
    const { username } = req.params;

    try {
        // Check if the user already exists
        let user = await User.findOne({ username, isDeleted: false });
        if (user) return res.status(200).json(user);

        // Fetch GitHub data
        const gitHubData = await fetchGitHubUser(username);
        console.log(gitHubData, "this is data checking");

        // Map GitHub data to your schema
        const userData = {
            username: gitHubData.login, // Map "login" to "username"
            name: gitHubData.name || '',
            location: gitHubData.location || '',
            blog: gitHubData.blog && gitHubData.blog.trim() !== '' ? gitHubData.blog : null, // Handle empty blog field
            bio: gitHubData.bio || '',
            public_repos: gitHubData.public_repos || 0,
            public_gists: gitHubData.public_gists || 0,
            followers: gitHubData.followers || 0,
            following: gitHubData.following || 0,
            created_at: new Date(gitHubData.created_at),
            updated_at: new Date(gitHubData.updated_at),
        };

        // Save to the database
        user = new User(userData);
        await user.save();
        res.status(201).json(user);
    } catch (error) {
        console.error("Error saving user:", error.message);
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
    const { username } = req.params;
    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(404).json({ error: 'User not found' });

        user.isDeleted = true;
        await user.save();
        res.status(200).json({ message: "User soft deleted" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update user details
const updateUser = async (req, res) => {
    const { username } = req.params;
    try {
        const updatedUser = await User.findOneAndUpdate(
            { username, isDeleted: false },
            req.body,
            { new: true }
        );
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
