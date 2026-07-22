const mongoose= require('mongoose');

const communitySchema= new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
    },
    invite_code: {
        type: String,
        required: true,
        unique: true
    },
    proposals: {
        type: [String],
        default: [],
    },
    members: {
        type: [String],
        default: []
    },
});

const Community= mongoose.model('Community',communitySchema);
module.exports= Community;