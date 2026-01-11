import httpx
from fastapi import HTTPException, Depends, Header
from functools import wraps
from typing import Optional
from ..config import settings

async def verify_firebase_token(authorization: Optional[str] = Header(None)) -> dict:
    """Verify Firebase ID token and return user info"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header required")
    
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization format")
    
    token = authorization.replace("Bearer ", "")
    
    try:
        # Verify token with Google's public keys
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"https://www.googleapis.com/identitytoolkit/v3/relyingparty/getAccountInfo?key=AIzaSyAWNRM6iWMYs6oy6-t0tN6Ih8cNhg0oI7I",
                headers={"Content-Type": "application/json"},
                json={"idToken": token},
                timeout=10.0
            )
            
            if response.status_code != 200:
                raise HTTPException(status_code=401, detail="Invalid or expired token")
            
            data = response.json()
            users = data.get("users", [])
            
            if not users:
                raise HTTPException(status_code=401, detail="User not found")
            
            user = users[0]
            email = user.get("email", "")
            
            return {
                "uid": user.get("localId"),
                "email": email,
                "is_admin": "admin" in email.lower() or email.endswith("@gov.in")
            }
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"Auth error: {e}")
        raise HTTPException(status_code=401, detail="Authentication failed")

async def get_current_user(authorization: Optional[str] = Header(None)) -> dict:
    """Get current authenticated user"""
    return await verify_firebase_token(authorization)

async def require_admin(authorization: Optional[str] = Header(None)) -> dict:
    """Require admin privileges"""
    user = await verify_firebase_token(authorization)
    if not user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Admin access required")
    return user
