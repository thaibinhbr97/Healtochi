import os
import asyncio
from solana.rpc.async_api import AsyncClient
from solders.keypair import Keypair
from spl.token.instructions import initialize_mint, TOKEN_PROGRAM_ID
from spl.token.constants import MINT_LEN
from solders.system_program import create_account, CreateAccountParams
from solders.transaction import Transaction
from solders.message import Message
from solders.pubkey import Pubkey
from base64 import b64decode
from dotenv import load_dotenv

load_dotenv()

SOLANA_RPC_URL = os.getenv("SOLANA_RPC_URL", "https://api.devnet.solana.com")
TREASURY_SECRET_KEY = os.getenv("TREASURY_SECRET_KEY")

async def create_healtocoin_mint():
    if not TREASURY_SECRET_KEY:
        print("TREASURY_SECRET_KEY missing")
        return

    # Load treasury keypair
    secret_bytes = b64decode(TREASURY_SECRET_KEY)
    payer = Keypair.from_bytes(secret_bytes)
    
    # Generate a new keypair for the mint
    mint_keypair = Keypair()
    mint_pubkey = mint_keypair.pubkey()
    
    print(f"Payer (Treasury): {payer.pubkey()}")
    print(f"New Mint Pubkey: {mint_pubkey}")

    async with AsyncClient(SOLANA_RPC_URL) as client:
        # Get recent blockhash
        res = await client.get_latest_blockhash()
        blockhash = res.value.blockhash

        # 1. Create account for the mint
        # Need to calculate rent-exempt balance
        rent_res = await client.get_minimum_balance_for_rent_exemption(MINT_LEN)
        lamports = rent_res.value

        create_ix = create_account(
            CreateAccountParams(
                from_pubkey=payer.pubkey(),
                to_pubkey=mint_pubkey,
                lamports=lamports,
                space=MINT_LEN,
                owner=TOKEN_PROGRAM_ID
            )
        )

        # 2. Initialize the mint
        from spl.token.instructions import InitializeMintParams
        init_ix = initialize_mint(
            InitializeMintParams(
                decimals=6,
                program_id=TOKEN_PROGRAM_ID,
                mint=mint_pubkey,
                mint_authority=payer.pubkey(),
                freeze_authority=payer.pubkey()
            )
        )

        # 3. Build and send transaction
        msg = Message.new_with_blockhash([create_ix, init_ix], payer.pubkey(), blockhash)
        txn = Transaction([payer, mint_keypair], msg, blockhash)
        
        res = await client.send_transaction(txn)
        print(f"Transaction Signature: {res.value}")
        print(f"MINT_ADDRESS={mint_pubkey}")
        print("\nSUCCESS! Add this MINT_ADDRESS to your .env file.")

if __name__ == "__main__":
    asyncio.run(create_healtocoin_mint())
