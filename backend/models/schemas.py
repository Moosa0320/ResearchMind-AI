from pydantic import BaseModel
from typing import List, Optional

class ResearchRequest(BaseModel):
    query: str
    use_documents: Optional[bool] = False

class ResearchResponse(BaseModel):
    session_id: str
    message: str
