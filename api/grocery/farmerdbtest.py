import os
import uvicorn
from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from typing import List
from sqlalchemy import create_engine, Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import sessionmaker, declarative_base, relationship, Session

# --- Database setup (SQLite for demo) ---
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./demo.db")
engine = create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# --- SQLAlchemy Models ---
class FarmerModel(Base):
    __tablename__ = "farmers"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)

    listings = relationship("ListingModel", back_populates="farmer", cascade="all, delete")

class ListingModel(Base):
    __tablename__ = "listings"
    id = Column(Integer, primary_key=True, index=True)
    farmer_id = Column(Integer, ForeignKey("farmers.id"), nullable=False)
    item = Column(String, index=True)
    price = Column(Float)
    quantity = Column(Integer)

    farmer = relationship("FarmerModel", back_populates="listings")

# create tables
Base.metadata.create_all(bind=engine)

# --- Pydantic Schemas ---
class Listing(BaseModel):
    item: str
    price: float
    quantity: int

class Farmer(BaseModel):
    username: str
    inventory: List[Listing] = []

class ListingResponse(Listing):
    id: int
    farmer_id: int
    class Config:
        orm_mode = True

class FarmerResponse(BaseModel):
    id: int
    username: str
    inventory: List[ListingResponse]
    class Config:
        orm_mode = True

# --- FastAPI setup ---
app = FastAPI(title="Farmer Listings API")

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- Endpoints ---
@app.post("/farmers", response_model=FarmerResponse)
def create_farmer(farmer: Farmer, db: Session = Depends(get_db)):
    db_farmer = FarmerModel(username=farmer.username)
    db.add(db_farmer)
    db.commit()
    db.refresh(db_farmer)
    return db_farmer

@app.get("/farmers/{username}", response_model=FarmerResponse)
def get_farmer(username: str, db: Session = Depends(get_db)):
    db_farmer = db.query(FarmerModel).filter(FarmerModel.username == username).first()
    if not db_farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")
    return db_farmer

@app.post("/farmers/{username}/listings", response_model=ListingResponse)
def new_listing(username: str, listing: Listing, db: Session = Depends(get_db)):
    # Find existing farmer
    db_farmer = db.query(FarmerModel).filter(FarmerModel.username == username).first()
    if not db_farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")
    # Create listing
    db_listing = ListingModel(
        farmer_id=db_farmer.id,
        item=listing.item,
        price=listing.price,
        quantity=listing.quantity
    )
    db.add(db_listing)
    db.commit()
    db.refresh(db_listing)
    return db_listing

@app.get("/farmers/{username}/listings", response_model=List[ListingResponse])
def list_listings(username: str, db: Session = Depends(get_db)):
    db_farmer = db.query(FarmerModel).filter(FarmerModel.username == username).first()
    if not db_farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")
    return db_farmer.listings

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("app:app", host="0.0.0.0", port=port)
