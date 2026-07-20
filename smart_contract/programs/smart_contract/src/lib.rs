pub mod constants;
pub mod errors;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("6HF7SL2ydXxthwKgFmw5ELh9QzkgrTav7AWEuKcCqh5S");

#[program]
pub mod smart_contract {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        initialize::handler(ctx)
    }

    pub fn create_proposal(ctx: Context<CreateProposal>, title: String, description: String, options: Vec<String>, id: u64, end_time: i64) -> Result<()> {
        create_proposal::create_proposal(ctx,title,description,options,id,end_time)
    }

    pub fn cast_vote(ctx: Context<CastVote>, option: u8) -> Result<()> {
        cast_vote::cast_vote(ctx,option)
    }

    pub fn finalize_proposal(ctx: Context<FinalizeProposal>) -> Result<()> {
        finalize_proposal::finalize_proposal(ctx)
    }

    pub fn close_proposal(ctx: Context<CloseProposal>) -> Result<()> {
        close_proposal::close_proposal(ctx)
    }
}
