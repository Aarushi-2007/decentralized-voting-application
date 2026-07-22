const Community = require('../models/community');
const generateInviteCode = require('../utils/generateInviteCode');

//Create a new community
const createCommunity= async(req,res) => {

    try{
        const { name,description }= req.body;

        const newCommunity= new Community({
            name,
            description,
            invite_code: generateInviteCode(),
            proposals: [],
        });

        const savedCommunity= await newCommunity.save();

        res.status(200).json(savedCommunity);
    }catch(err){
        console.log(err);
        res.status(500).json({
            error: "Internal server error",
        });
    }
};

//Add Proposal PDA to community
const addProposalToCommunity= async(req,res) => {
    try{
        const { proposalAddress }= req.body;

        const community= await Community.findById(req.params._id);

        if(!community){
            return res.status(404).json({
                error: 'Community not found',
            });
        }

        community.proposals.push(proposalAddress);

        await community.save();

        res.status(200).json(community);
    }catch(err){
        console.log(err);
        res.status(500).json({
            error: 'Internal server error',
        });
    }
}

//Join a community by invite link
const joinCommunity= async(req,res) => {
    try{
        const{ invite_code }= req.params;
        const { wallet }= req.body;

        const community= await Community.findOne({invite_code});

        if(!community){
            return res.status(404).json({
                error: 'Community not found',
            });
        }

        if(community.members.includes(wallet)){
            return res.status(404).json({
                error: 'Already joined this community',
            });
        }

        community.members.push(wallet);

        await community.save();

        res.status(200).json(community);
    }catch(err){
        console.log(err);
        res.status(500).json({
            error: 'Internal server error',
        });
    }
};

//Get your joined communities

const getJoinedCommunities= async(req,res) => {
    try{
        const { wallet }= req.params;

        const communities= await Community.find({
            members: wallet,
        });

        res.status(200).json(communities);
    }catch(err){
        console.log(err);

        res.status(500).json({
            error: "Internal server error",
        });
    };
}

const getCommunity= async(req,res) => {
    try{
        const{ invite_code }= req.params;
        const community= await Community.findOne({invite_code});

        if(!community){
            return res.status(404).json({
                error: 'Community not found',
            });
        }

        res.status(200).json(community);
    }catch(err){
        console.log(err);

        res.status(500).json({
            error: 'Internal server error',
        });
    }
}


module.exports= {
    createCommunity,
    addProposalToCommunity,
    joinCommunity,
    getJoinedCommunities,
    getCommunity,
}