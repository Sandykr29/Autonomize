const axios = require('axios');

const fetchGitHubUser = async (username) => {
    try {
        const response = await axios.get(`https://api.github.com/users/${username}`);
        return response.data;
    } catch (error) {
        throw new Error('GitHub user not found');
    }
};

module.exports = { fetchGitHubUser };
