from fastapi import APIRouter

from app.api.v1 import chat, labels

api_router = APIRouter()

api_router.include_router(chat.router, prefix="/chat", tags=["chat"])
api_router.include_router(labels.router, prefix="/labels", tags=["labels"])


@api_router.get("/health")
async def health_check():
    return {"status": "ok"}
