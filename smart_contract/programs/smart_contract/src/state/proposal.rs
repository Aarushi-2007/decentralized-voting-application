use anchor_lang::prelude::*;

#[account]
pub struct Proposal {
    pub creator: Pubkey,
    pub id: u64,
    pub title: String,
    pub description: String,
    pub options: Vec<String>,
    pub vote_counts: Vec<u64>,
    pub end_time: i64,
    pub finalized: bool,
    pub winning_option: Option<u16>,
}
