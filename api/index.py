import os
import sys

# Ensure root workspace directory is in python path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from backend.app import app

# Export app handler for Vercel Serverless Function
handler = app
