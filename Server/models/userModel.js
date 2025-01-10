const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        minlength: [3, 'Username must be at least 3 characters long'],
        maxlength: [30, 'Username cannot exceed 30 characters'],
    },
    name: {
        type: String,
        trim: true,
    },
    location: {
        type: String,
        trim: true,
        minlength: [2, 'Location must be at least 2 characters long'],
    },
    blog: {
        type: String,
        validate: {
            validator: function (v) {
                return /^https?:\/\/[\w\-]+(\.[\w\-]+)+[/#?]?.*$/.test(v);
            },
            message: 'Invalid blog URL format',
        },
    },
    bio: {
        type: String,
        maxlength: [200, 'Bio cannot exceed 200 characters'],
    },
    public_repos: {
        type: Number,
        min: [0, 'Public repos cannot be negative'],
    },
    public_gists: {
        type: Number,
        min: [0, 'Public gists cannot be negative'],
    },
    followers: {
        type: Number,
        min: [0, 'Followers cannot be negative'],
    },
    following: {
        type: Number,
        min: [0, 'Following cannot be negative'],
    },
    created_at: {
        type: Date,
        required: true,
    },
    updated_at: {
        type: Date,
        required: true,
    },
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isDeleted: {
        type: Boolean,
        default: false,
    },
});

module.exports = mongoose.model('User', userSchema);
