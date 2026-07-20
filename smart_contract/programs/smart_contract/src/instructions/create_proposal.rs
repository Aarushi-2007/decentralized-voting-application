use anchor_lang::prelude::*;
use crate::state::proposal::Proposal;

#[derive(Accounts)]

pub struct CreateProposal<'info> {
    #[account(init, payer = creator, seeds = [
        b"proposal",
        creator.key().as_ref(),
        ],
        bump,
        space= 8 //discriminator
        +32 // creator
        +8 //id
        +(4+100) //title
        +(4+500) //description
        +(4+5*(4+50)) //options
        +(4+(5*8)) //count votes
        +8 //end time
        +1 //finalized
        +(4+50) //winning option
    )] 

    pub proposal: Account<'info, Proposal>,
    #[account(mut)]
    pub creator: Signer<'info>,
    pub system_program: Program<'info,System>
}


pub fn create_proposal(ctx: Context<CreateProposal>, title: String, description: String, options: Vec<String>, id: u64,end_time: i64)
-> Result<()> {
    let proposal= &mut ctx.accounts.proposal;
    proposal.title= title;
    proposal.description= description;
    proposal.creator= ctx.accounts.creator.key();
    proposal.vote_counts = vec![0; options.len()];
    proposal.options= options;
    proposal.id= id;
    proposal.end_time= end_time;
    msg!("Proposal created successfully");
    Ok(())
}
