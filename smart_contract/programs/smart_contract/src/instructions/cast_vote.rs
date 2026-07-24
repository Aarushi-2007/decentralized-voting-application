use anchor_lang::prelude::*;
use crate::state::proposal::Proposal;
use crate::state::vote::Vote;

#[derive(Accounts)]

pub struct CastVote<'info> {
    #[account(init, payer= member, 
        seeds= [
            b"vote",
            member.key().as_ref(),
            proposal.key().as_ref(),
        ],
        bump,
        space= 8
        +32
        +(4+50)
    )]
    pub vote: Account<'info,Vote>,

    #[account(mut)]
    pub proposal: Account<'info,Proposal>,
    #[account(mut)]
    pub member: Signer<'info>,
    pub system_program: Program<'info,System>,

}

pub fn cast_vote(ctx: Context<CastVote>, option: u8) -> Result<()> {
    let vote= &mut ctx.accounts.vote;
    let proposal= &mut ctx.accounts.proposal;
    vote.member= ctx.accounts.member.key();
    vote.option= option;
    proposal.vote_counts[option as usize]+=1;
    msg!("Your vote has been casted, THANKYOU");
    Ok(())
}