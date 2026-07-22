const express= require('express');
const router= express.Router();
const Community= require('./../models/community');


const {
    createCommunity,
    addProposalToCommunity,
    joinCommunity,
    getJoinedCommunities,
    getCommunity,
}= require('./../controllers/communityController');

//Create a new community
router.post('/', createCommunity);

//Join a community
router.post('/join/:invite_code', joinCommunity);

//Add a proposal to the community
router.post('/:_id/proposals', addProposalToCommunity);

//Get your joined communities
router.get('/user/:wallet', getJoinedCommunities);

//Get the community you clicked on
router.get('/:invite_code',getCommunity);

module.exports= router;