from fastapi import APIRouter

from app.schemas.label import LabelRequest, LabelResponse
from app.services.label_extractor import extract_label

router = APIRouter()


@router.post("/extract", response_model=LabelResponse)
async def extract_labels(request: LabelRequest):
    result = await extract_label(request.text, request.provider)
    return result
