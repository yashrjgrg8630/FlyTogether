from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import AirportModel
from ..schemas import AirportResponse

router = APIRouter(prefix="/airports", tags=["airports"])

@router.get("", response_model=List[AirportResponse])
def search_airports(q: str = "", db: Session = Depends(get_db)):
    query = db.query(AirportModel)
    term = q.strip().lower()
    if term:
        query = query.filter(
            (AirportModel.iata_code.ilike(f"%{term}%"))
            | (AirportModel.city.ilike(f"%{term}%"))
            | (AirportModel.airport_name.ilike(f"%{term}%"))
        )
    return [AirportResponse.model_validate(a) for a in query.limit(25).all()]
