from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, UserAICredential
from app.schemas import AIConnectRequest, AIStatusResponse, AITestResponse, ModelOption
from app.auth import get_current_user
from app.services.crypto_service import encrypt_key
from app.services.ai_service import test_ai_connection, PROVIDER_MODELS

router = APIRouter(prefix="/ai/vault", tags=["Bóveda BYOK (Bring Your Own Key)"])

@router.get("/status", response_model=AIStatusResponse)
def get_vault_status(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    cred = db.query(UserAICredential).filter(
        UserAICredential.user_id == current_user.id,
        UserAICredential.is_active == True
    ).first()

    if not cred:
        return AIStatusResponse(
            is_connected=False,
            provider=None,
            model_name=None,
            latency_ms=None,
            last_tested_at=None,
            available_models=[]
        )

    models = PROVIDER_MODELS.get(cred.provider, [])
    return AIStatusResponse(
        is_connected=True,
        provider=cred.provider,
        model_name=cred.model_name,
        latency_ms=cred.latency_ms,
        last_tested_at=cred.updated_at,
        available_models=models
    )

@router.post("/test", response_model=AITestResponse)
async def test_connection_only(request: AIConnectRequest, current_user: User = Depends(get_current_user)):
    success, latency_ms, msg, models = await test_ai_connection(request.provider, request.api_key, request.model_name)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Fallo en prueba de conexión: {msg}"
        )
    
    default_model = request.model_name or (models[0].id if models else "default")
    return AITestResponse(
        success=True,
        latency_ms=latency_ms,
        message=msg,
        provider=request.provider,
        model_name=default_model,
        models=models
    )

@router.post("/connect", response_model=AITestResponse)
async def connect_ai_key(
    request: AIConnectRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    success, latency_ms, msg, models = await test_ai_connection(request.provider, request.api_key, request.model_name)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"No se pudo validar la clave de API con el proveedor {request.provider.upper()}: {msg}"
        )

    model_to_use = request.model_name or (models[0].id if models else "default")
    encrypted = encrypt_key(request.api_key)

    cred = db.query(UserAICredential).filter(UserAICredential.user_id == current_user.id).first()
    if cred:
        cred.provider = request.provider
        cred.encrypted_api_key = encrypted
        cred.model_name = model_to_use
        cred.latency_ms = latency_ms
        cred.is_active = True
    else:
        cred = UserAICredential(
            user_id=current_user.id,
            provider=request.provider,
            encrypted_api_key=encrypted,
            model_name=model_to_use,
            latency_ms=latency_ms,
            is_active=True
        )
        db.add(cred)

    db.commit()

    return AITestResponse(
        success=True,
        latency_ms=latency_ms,
        message="Credenciales BYOK validadas, cifradas y vinculadas exitosamente",
        provider=request.provider,
        model_name=model_to_use,
        models=models
    )

@router.delete("/disconnect")
def disconnect_ai(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    cred = db.query(UserAICredential).filter(UserAICredential.user_id == current_user.id).first()
    if cred:
        cred.is_active = False
        db.commit()
    return {"message": "Conexión de IA desacoplada exitosamente"}
