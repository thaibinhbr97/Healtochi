import os
import asyncio
from solana.rpc.async_api import AsyncClient
from solders.keypair import Keypair
from solders.pubkey import Pubkey
from solders.transaction import Transaction
from solders.message import Message
from spl.token.instructions import (
    mint_to_checked, MintToCheckedParams,
    get_associated_token_address,
    create_associated_token_account
)
from spl.token.constants import TOKEN_PROGRAM_ID
from base64 import b64decode
from dotenv import load_dotenv

load_dotenv()

SOLANA_RPC_URL = os.getenv("SOLANA_RPC_URL", "https://api.devnet.solana.com")
TREASURY_SECRET_KEY = os.getenv("TREASURY_SECRET_KEY")
HEALTOCOIN_MINT = os.getenv("HEALTOCOIN_MINT")

TOKEN_DECIMALS = 6
# Mint 1,000,000 $HLT to the treasury (with 6 decimals = 1,000,000,000,000 units)
AMOUNT_TO_MINT = 1_000_000 * (10 ** TOKEN_DECIMALS)

async def mint_initial_supply():
    if not TREASURY_SECRET_KEY or not HEALTOCOIN_MINT:
        print("TREASURY_SECRET_KEY or HEALTOCOIN_MINT missing")
        return

    secret_bytes = b64decode(TREASURY_SECRET_KEY)
    payer = Keypair.from_bytes(secret_bytes)
    mint_pubkey = Pubkey.from_string(HEALTOCOIN_MINT)

    print(f"Treasury (Mint Authority): {payer.pubkey()}")
    print(f"Mint Address: {mint_pubkey}")
    print(f"Amount to Mint: {AMOUNT_TO_MINT / (10**TOKEN_DECIMALS):,.0f} $HLT")

    async with AsyncClient(SOLANA_RPC_URL) as client:
        res = await client.get_latest_blockhash()
        blockhash = res.value.blockhash

        # Get or create treasury ATA
        treasury_ata = get_associated_token_address(payer.pubkey(), mint_pubkey)
        res_ata = await client.get_account_info(treasury_ata)
        
        instructions = []
        if res_ata.value is None:
            print(f"Creating Treasury ATA: {treasury_ata}")
            create_ix = create_associated_token_account(
                payer=payer.pubkey(),
                owner=payer.pubkey(),
                mint=mint_pubkey,
                token_program_id=TOKEN_PROGRAM_ID
            )
            instructions.append(create_ix)

        # Mint tokens to treasury ATA
        mint_ix = mint_to_checked(
            MintToCheckedParams(
                program_id=TOKEN_PROGRAM_ID,
                mint=mint_pubkey,
                dest=treasury_ata,
                mint_authority=payer.pubkey(),
                amount=AMOUNT_TO_MINT,
                decimals=TOKEN_DECIMALS
            )
        )
        instructions.append(mint_ix)

        msg = Message.new_with_blockhash(instructions, payer.pubkey(), blockhash)
        txn = Transaction([payer], msg, blockhash)

        res = await client.send_transaction(txn)
        print(f"Transaction Signature: {res.value}")
        print("\nSUCCESS! Treasury now has initial $HLT supply.")

if __name__ == "__main__":
    asyncio.run(mint_initial_supply())
