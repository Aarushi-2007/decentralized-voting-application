use anchor_lang::prelude::*;

#[account]
pub struct Vote {
    pub member: Pubkey,
    pub option: u8,
}