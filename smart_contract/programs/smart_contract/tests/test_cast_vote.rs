
use {
    anchor_lang::{solana_program::instruction::Instruction, InstructionData, ToAccountMetas},
    litesvm::LiteSVM,
    solana_message::{Message, VersionedMessage},
    solana_signer::Signer,
    solana_keypair::Keypair,
    solana_transaction::versioned::VersionedTransaction,
};

use anchor_lang::system_program;
use solana_pubkey::Pubkey;


#[test]

fn test_cast_vote() {
    let program_id= smart_contract::id();
    let member= Keypair::new();
    let creator= Keypair::new();
    let mut svm= LiteSVM::new();
    let bytes = include_bytes!("../../../target/deploy/smart_contract.so");
    let proposal_id: u64 = 1;
    let (proposal_pda, _bump) = Pubkey::find_program_address(
        &[
            b"proposal",
            creator.pubkey().as_ref(),
            &proposal_id.to_le_bytes(),
        ],
        &smart_contract::ID,
    );
    let (vote_pda, _bump) = Pubkey::find_program_address(
        &[
            b"vote",
            member.pubkey().as_ref(),
            proposal_pda.as_ref(),
        ],
        &smart_contract::ID,
    );

    svm.add_program(program_id, bytes).unwrap();
    svm.airdrop(&member.pubkey(), 1_000_000_000).unwrap();
    svm.airdrop(&creator.pubkey(), 1_000_000_000).unwrap();

    let create_proposal= Instruction::new_with_bytes(
        program_id,
        &smart_contract::instruction::CreateProposal{title: "Test Proposal".to_string(), description: "Testing the program".to_string(), 
        options: vec!["first".to_string(), "second".to_string(), "third".to_string()],
        id: 1, end_time: 3 }.data(),
        smart_contract::accounts::CreateProposal{creator: creator.pubkey(),
                                                           proposal: proposal_pda,
                                                           system_program: system_program::ID}.to_account_metas(None),
    );
    let blockhash= svm.latest_blockhash();
    let msg= Message::new_with_blockhash(&[create_proposal], Some(&creator.pubkey()), &blockhash);
    let tx= VersionedTransaction::try_new(VersionedMessage::Legacy(msg), &[creator]).unwrap();
    let p_res= svm.send_transaction(tx);
    assert!(p_res.is_ok());

    let instruction= Instruction::new_with_bytes(
        program_id,
        &smart_contract::instruction::CastVote{option: 2}.data(),
        smart_contract::accounts::CastVote{member: member.pubkey(),
                                                    proposal: proposal_pda,
                                                    vote: vote_pda,
                                                    system_program: system_program::ID}.to_account_metas(None),
    );

    let blockhash= svm.latest_blockhash();
    let msg= Message::new_with_blockhash(&[instruction], Some(&member.pubkey()), &blockhash);
    let tx= VersionedTransaction::try_new(VersionedMessage::Legacy(msg), &[member]).unwrap();

    let res= svm.send_transaction(tx);
    println!("{:#?}", res);
    assert!(res.is_ok());
}