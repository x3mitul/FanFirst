# Account Agent - With robust fallbacks
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage
from typing import List, Dict, AsyncGenerator
import os

ACCOUNT_RESPONSES: Dict[str, str] = {
    "wallet": """🔗 **Connect Your Wallet**

To connect:
1. Click **"Connect Wallet"** in the header
2. Choose your wallet:
   - MetaMask (EVM)
   - Phantom (Solana)
3. Approve the connection

**Supported:** Polygon, Ethereum, Solana

Once connected, you can buy NFT tickets!""",

    "fandom": """📊 **Your Fandom Score**

Fandom Score shows your fan engagement level.

**Earn points by:**
- 🎫 Attending events: +50
- 💬 Community posts: +10
- ✅ FanIQ Quiz: +5-25
- 🤝 Getting vouched: +15

**Higher score = earlier ticket access!**

View your score: Dashboard → Profile""",

    "score": """📊 **Fandom Score**

Your engagement level that unlocks benefits!

**Earn points:**
- Attend events: +50
- Community posts: +10
- FanIQ Quiz: +5-25

Check yours at Dashboard → Profile""",

    "spotify": """🎵 **Spotify Integration**

Connect Spotify to verify your fan status:
1. Go to Dashboard → Settings
2. Click "Connect Spotify"
3. Authorize FanFirst

**Benefits:**
- Boost Fandom Score for following artists
- Personalized event recommendations

Your data stays private!""",

    "login": """🔐 **Login Help**

To sign in:
1. Click "Sign In" in header
2. Use Google, Email, or Wallet
3. Complete verification

**Issues?**
- Clear browser cookies
- Try incognito mode
- Email: support@fanfirst.com""",

    "profile": """👤 **Your Profile**

Manage your profile at Dashboard → Profile:
- Update name and avatar
- View Fandom Score
- See attendance history
- Manage connected accounts

**Connected accounts:**
- Wallet (required for purchases)
- Spotify (optional, boosts score)""",
}

DEFAULT_ACCOUNT = """👤 **Account Support**

I can help with:
- 🔗 **Wallet** - Connect MetaMask or Phantom
- 📊 **Fandom Score** - Check and improve it
- 🎵 **Spotify** - Link for fan verification
- 🔐 **Login** - Sign in issues

**Quick links:**
- Your profile: /dashboard
- Settings: /settings

What do you need help with?"""


def find_account_response(message: str) -> str | None:
    msg_lower = message.lower()
    for key, response in ACCOUNT_RESPONSES.items():
        if key in msg_lower:
            return response
    return None


class AccountAgent:
    """Account support with fallbacks"""
    
    def __init__(self):
        self._llm = None
    
    @property
    def llm(self):
        if self._llm is None:
            api_key = os.getenv("GEMINI_API_KEY")
            if api_key:
                try:
                    self._llm = ChatGoogleGenerativeAI(
                        model="gemini-1.5-flash",
                        google_api_key=api_key,
                        temperature=0.7,
                        streaming=True,
                    )
                except Exception as e:
                    print(f"[AccountAgent] Failed to init LLM: {e}")
        return self._llm
    
    async def stream_response(
        self, 
        message: str, 
        history: List[Dict], 
        db=None,
        user_id: str = None
    ) -> AsyncGenerator[str, None]:
        
        cached = find_account_response(message)
        if cached:
            for i in range(0, len(cached), 15):
                yield cached[i:i+15]
            return
        
        if self.llm:
            try:
                prompt = f"""You are Account Support for FanFirst.
Help with: profile, wallet, fandom score, spotify.
Be brief.

User: {message}

Reply:"""
                
                async for chunk in self.llm.astream([HumanMessage(content=prompt)]):
                    if chunk.content:
                        yield chunk.content
                return
            except Exception as e:
                print(f"[AccountAgent] LLM error: {e}")
        
        for i in range(0, len(DEFAULT_ACCOUNT), 15):
            yield DEFAULT_ACCOUNT[i:i+15]
