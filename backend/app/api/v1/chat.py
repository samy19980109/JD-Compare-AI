import json

from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from app.schemas.chat import ChatRequest
from app.services.llm.factory import get_provider
from app.services.llm.prompt_builder import build_prompt_parts

router = APIRouter()


@router.post("/stream")
async def stream_chat(request: ChatRequest):
    provider = get_provider(request.provider)
    prompt_parts = build_prompt_parts(request)

    async def event_generator():
        try:
            async for token in provider.stream_chat(prompt_parts):
                yield f"data: {json.dumps({'token': token})}\n\n"
            yield f"data: {json.dumps({'done': True})}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
