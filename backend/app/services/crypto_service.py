import base64
import hashlib
from cryptography.fernet import Fernet
from app.config import settings

def _get_fernet() -> Fernet:
    # Derive a valid 32-byte url-safe base64 key from settings.ENCRYPTION_KEY
    key_bytes = hashlib.sha256(settings.ENCRYPTION_KEY.encode()).digest()
    fernet_key = base64.urlsafe_b64encode(key_bytes)
    return Fernet(fernet_key)

def encrypt_key(plain_key: str) -> str:
    f = _get_fernet()
    return f.encrypt(plain_key.encode()).decode()

def decrypt_key(encrypted_key: str) -> str:
    f = _get_fernet()
    return f.decrypt(encrypted_key.encode()).decode()
