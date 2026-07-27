import os
import sys

# Ensure root workspace directory is in python path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from fastapi import FastAPI
from backend.app import app as backend_app

# Mount the existing FastAPI app under /api so Vercel rewrites work correctly.
app = FastAPI(title="ResearchMind AI Gateway")
app.mount("/api", backend_app)

# Export app handler for Vercel Serverless Function
handler = app
