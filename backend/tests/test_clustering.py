import sys
import os
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.database import Base
from app.models import UserModel, AirportModel, TravelRequestModel, GroupModel
from app.services.clustering import cluster_and_form_groups

SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
Session = sessionmaker(bind=engine)

@pytest.fixture
def db():
    Base.metadata.create_all(bind=engine)
    session = Session()

    # Seed airports
    blr = AirportModel(id="ap_BLR", iata_code="BLR", airport_name="Kempegowda", city="Bengaluru", country="India")
    del_ap = AirportModel(id="ap_DEL", iata_code="DEL", airport_name="Indira Gandhi", city="New Delhi", country="India")
    u1 = UserModel(id="u_1", full_name="User One", email="u1@test.com", password_hash="hash", role="traveller")
    u2 = UserModel(id="u_2", full_name="User Two", email="u2@test.com", password_hash="hash", role="traveller")
    u3 = UserModel(id="u_3", full_name="User Three", email="u3@test.com", password_hash="hash", role="traveller")
    session.add_all([blr, del_ap, u1, u2, u3])
    session.commit()

    yield session
    session.close()
    Base.metadata.drop_all(bind=engine)

def test_clustering_forms_group_when_threshold_reached(db):
    # Add requests totaling 11 seats on same route and overlapping dates
    r1 = TravelRequestModel(
        id="r_c1", user_id="u_1", origin_id="ap_BLR", destination_id="ap_DEL",
        departure_date="2027-03-10", flexibility_days=2, passenger_count=4, status="open"
    )
    r2 = TravelRequestModel(
        id="r_c2", user_id="u_2", origin_id="ap_BLR", destination_id="ap_DEL",
        departure_date="2027-03-11", flexibility_days=1, passenger_count=4, status="open"
    )
    r3 = TravelRequestModel(
        id="r_c3", user_id="u_3", origin_id="ap_BLR", destination_id="ap_DEL",
        departure_date="2027-03-12", flexibility_days=2, passenger_count=3, status="open"
    )
    db.add_all([r1, r2, r3])
    db.commit()

    result = cluster_and_form_groups(db, min_seats_threshold=10)
    assert result["groups_created"] == 1
    assert result["requests_grouped"] == 3

    # Verify group was created and requests updated
    new_group = db.query(GroupModel).filter(GroupModel.id == result["group_ids"][0]).first()
    assert new_group is not None
    assert new_group.route == "BLR-DEL"
    assert new_group.seats_filled == 11
    assert new_group.status == "quotation_eligible"

    # Verify requests are now grouped
    assert r1.status == "grouped"
    assert r1.group_id == new_group.id
