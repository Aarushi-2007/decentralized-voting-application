use anchor_lang::prelude::*;
use crate::state::proposal::Proposal;
use crate::errors::DaoError;

#[derive(Accounts)]

pub struct FinalizeProposal<'info> {

    #[account(mut)]
    pub proposal: Account<'info,Proposal>,
    pub signer: Signer<'info>,
    
}

pub fn finalize_proposal(ctx: Context<FinalizeProposal>) -> Result<()> {
    let proposal= &mut ctx.accounts.proposal;

    let current_time= Clock::get()?.unix_timestamp;

    msg!("Current time: {}", current_time);
    msg!("Proposal end_time: {}", proposal.end_time);

    require!(
        current_time>=proposal.end_time,
        DaoError::VotingStillOpen
    );

    require!(
        !proposal.finalized,
        DaoError::AlreadyFinalized
    );

    require!(
        !proposal.vote_counts.is_empty(),
        DaoError::NoOptions
    );

    let mut winner= 0;
    let mut max_votes= proposal.vote_counts[0];

    for i in 1..proposal.vote_counts.len() {
        if proposal.vote_counts[i]>max_votes{
            max_votes= proposal.vote_counts[i];
            winner= i;
        }
    }

    proposal.winning_option= Some(winner as u16);
    proposal.finalized= true;


    msg!("This proposal has been finalized");

    Ok(())
    
}