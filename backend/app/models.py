import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    String,
    Integer,
    Float,
    Boolean,
    ForeignKey,
    DateTime,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship
from .database import Base

def gen_id(prefix: str) -> str:
    return f"{prefix}_{uuid.uuid4().hex[:12]}"

class UserModel(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: gen_id("u"))
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, default="traveller", nullable=False) # traveller | admin
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    requests = relationship("TravelRequestModel", back_populates="user")
    memberships = relationship("GroupMemberModel", back_populates="user")
    notifications = relationship("NotificationModel", back_populates="user")

class AirportModel(Base):
    __tablename__ = "airports"

    id = Column(String, primary_key=True)
    iata_code = Column(String(3), unique=True, index=True, nullable=False)
    airport_name = Column(String, nullable=False)
    city = Column(String, nullable=False)
    country = Column(String, default="India", nullable=False)

class TravelRequestModel(Base):
    __tablename__ = "travel_requests"

    id = Column(String, primary_key=True, default=lambda: gen_id("r"))
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    origin_id = Column(String, ForeignKey("airports.id"), nullable=False)
    destination_id = Column(String, ForeignKey("airports.id"), nullable=False)
    departure_date = Column(String, nullable=False) # YYYY-MM-DD
    flexibility_days = Column(Integer, default=2, nullable=False)
    passenger_count = Column(Integer, default=1, nullable=False)
    max_budget = Column(Float, nullable=True)
    status = Column(String, default="open", nullable=False) # open | grouped | cancelled
    group_id = Column(String, ForeignKey("groups.id"), nullable=True, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("UserModel", back_populates="requests")
    origin = relationship("AirportModel", foreign_keys=[origin_id])
    destination = relationship("AirportModel", foreign_keys=[destination_id])
    group = relationship("GroupModel", back_populates="requests")

class GroupModel(Base):
    __tablename__ = "groups"

    id = Column(String, primary_key=True, default=lambda: gen_id("g"))
    route = Column(String, nullable=False) # e.g. "BLR-DEL"
    origin_id = Column(String, ForeignKey("airports.id"), nullable=False)
    destination_id = Column(String, ForeignKey("airports.id"), nullable=False)
    target_date = Column(String, nullable=False)
    window_start = Column(String, nullable=False)
    window_end = Column(String, nullable=False)
    seats_filled = Column(Integer, default=0, nullable=False)
    max_seats = Column(Integer, default=30, nullable=False)
    min_seats_for_quote = Column(Integer, default=10, nullable=False)
    status = Column(String, default="forming", nullable=False) # forming | quotation_eligible | quote_requested | quoted | closed
    quote_deadline = Column(String, nullable=True)
    created_at = Column(String, nullable=False)

    origin = relationship("AirportModel", foreign_keys=[origin_id])
    destination = relationship("AirportModel", foreign_keys=[destination_id])
    members = relationship("GroupMemberModel", back_populates="group", cascade="all, delete-orphan")
    requests = relationship("TravelRequestModel", back_populates="group")
    quotes = relationship("QuoteModel", back_populates="group")

class GroupMemberModel(Base):
    __tablename__ = "group_members"

    id = Column(String, primary_key=True, default=lambda: gen_id("gm"))
    group_id = Column(String, ForeignKey("groups.id"), nullable=False, index=True)
    travel_request_id = Column(String, ForeignKey("travel_requests.id"), unique=True, nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    display_name = Column(String, nullable=False) # Safe alias, e.g. "Aarav S."
    passenger_count = Column(Integer, nullable=False)
    joined_at = Column(String, nullable=False)

    __table_args__ = (
        UniqueConstraint("group_id", "user_id", name="uq_group_user"),
    )

    group = relationship("GroupModel", back_populates="members")
    user = relationship("UserModel", back_populates="memberships")
    request = relationship("TravelRequestModel")

class QuoteModel(Base):
    __tablename__ = "quotes"

    id = Column(String, primary_key=True, default=lambda: gen_id("q"))
    group_id = Column(String, ForeignKey("groups.id"), nullable=False, index=True)
    airline_name = Column(String, nullable=False)
    price_per_passenger = Column(Float, nullable=False)
    available_seats = Column(Integer, nullable=False)
    source_type = Column(String, default="manual", nullable=False) # manual | simulated
    baggage_details = Column(String, nullable=False)
    terms = Column(String, nullable=False)
    valid_until = Column(String, nullable=False)
    status = Column(String, default="draft", nullable=False) # draft | published | expired

    group = relationship("GroupModel", back_populates="quotes")

class NotificationModel(Base):
    __tablename__ = "notifications"

    id = Column(String, primary_key=True, default=lambda: gen_id("n"))
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String, nullable=False)
    message = Column(String, nullable=False)
    read = Column(Boolean, default=False, nullable=False)
    link = Column(String, nullable=True)
    created_at = Column(String, nullable=False)

    user = relationship("UserModel", back_populates="notifications")
