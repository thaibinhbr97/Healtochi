import os
import httpx
from solana.rpc.async_api import AsyncClient
from solders.keypair import Keypair
from solders.pubkey import Pubkey
from solders.system_program import TransferParams, transfer
from solders.transaction import Transaction
from solders.message import Message
from dotenv import load_dotenv

load_dotenv()

SOLANA_RPC_URL = os.getenv("SOLANA_RPC_URL", "https://api.devnet.solana.com")
# In a real app, this would be a secure vault or the user's wallet
TREASURY_SECRET_KEY = os.getenv("TREASURY_SECRET_KEY")

async def reward_user(user_pubkey_str: str, amount_lamports: int):
    if not TREASURY_SECRET_KEY:
        print("Solana Treasury Secret Key missing")
        return {"status": "error", "message": "Treasury not configured"}
    
    try:
        from base64 import b64decode
        import json
        
        # Handle both base64 and potential JSON format keypairs
        try:
            secret_bytes = b64decode(TREASURY_SECRET_KEY)
            treasury_keypair = Keypair.from_bytes(secret_bytes)
        except:
            # Maybe it's a list of ints in a string?
            key_data = json.loads(TREASURY_SECRET_KEY)
            treasury_keypair = Keypair.from_bytes(bytes(key_data))
            
        async with AsyncClient(SOLANA_RPC_URL) as client:
            user_pubkey = Pubkey.from_string(user_pubkey_str)
            
            # 1. Get recent blockhash
            res = await client.get_latest_blockhash()
            blockhash = res.value.blockhash
            
            # 2. Create instruction
            ix = transfer(
                TransferParams(
                    from_pubkey=treasury_keypair.pubkey(),
                    to_pubkey=user_pubkey,
                    lamports=amount_lamports
                )
            )
            
            # 3. Create message and transaction
            msg = Message.new_with_blockhash([ix], treasury_keypair.pubkey(), blockhash)
            txn = Transaction([treasury_keypair], msg, blockhash)
            
            # 4. Send
            res = await client.send_transaction(txn)
            return {"status": "success", "signature": str(res.value)}
            
    except Exception as e:
        print(f"Solana error: {e}")
        return {"status": "error", "message": str(e)}
