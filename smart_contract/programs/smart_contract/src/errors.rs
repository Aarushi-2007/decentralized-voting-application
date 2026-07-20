use anchor_lang::prelude::*;

#[error_code]
pub enum DaoError {
    #[msg("You are not allowed to close the proposal")]
    Unauthorized,

    #[msg("The voting is still open")]
    VotingStillOpen,

    #[msg("The proposal has already finalized")]
    AlreadyFinalized,

    #[msg("There are no options to this proposal")]
    NoOptions,

    

}
