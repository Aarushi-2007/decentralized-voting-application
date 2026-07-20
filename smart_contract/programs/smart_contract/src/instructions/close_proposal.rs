use anchor_lang::prelude::*;
use crate::state::proposal::Proposal;

#[derive(Accounts)]

pub struct CloseProposal<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,

    #[account(mut,
        seeds= [
            b"proposal",
            creator.key().as_ref(),
        ],
        bump,
        close= creator,
    )]
    pub proposal: Account<'info,Proposal>
}


pub fn close_proposal(ctx: Context<CloseProposal>) -> Result<()> {

    msg!("This proposal has been closed");
    Ok(())
}