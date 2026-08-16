from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import deliveries, game, players

app = FastAPI(title="Moon Courier Crisis")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(players.router)
app.include_router(game.router)
app.include_router(deliveries.router)
