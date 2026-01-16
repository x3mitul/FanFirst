# FAQ Agent - With robust fallbacks
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage
from typing import List, Dict, AsyncGenerator
import os

# Pre-built FAQ responses (instant, no API call)
FAQ_CACHE: Dict[str, str] = {
    "what is fanfirst": """🎫 **FanFirst** is an AI-powered NFT ticketing platform that ensures real fans get access to tickets before scalpers and bots.

**Key Features:**
- 🛡️ Anti-bot protection via FanIQ Quiz
- 🎟️ NFT tickets stored on blockchain
- 📊 Fandom Score for early access
- 💰 Smart resale caps to prevent scalping

Ready to experience ticketing done right!""",

    "how does": """Here's how FanFirst works:

1️⃣ **Create Account** - Sign up and connect your wallet
2️⃣ **Prove Fandom** - Take the FanIQ quiz to verify you're a real fan
3️⃣ **Get Priority** - Higher Fandom Score = earlier ticket access
4️⃣ **Buy Tickets** - Purchase NFT tickets minted to your wallet
5️⃣ **Attend Event** - Use QR code for entry

Simple, secure, and fair!""",

    "nft": """🎟️ **NFT Tickets** are blockchain-based digital tickets.

**Benefits:**
- ✅ Verifiable authenticity (can't be faked)
- ✅ Truly yours (stored in your crypto wallet)
- ✅ Transferable with rules (resale caps apply)
- ✅ Proof of attendance forever

Unlike traditional tickets, NFT tickets can't be counterfeited!""",

    "fandom score": """📊 **Fandom Score** measures your fan engagement.

**How to earn points:**
- 🎫 Attend events: +50 points
- 💬 Community posts: +10 points
- ✅ Take FanIQ Quiz: +5-25 points
- 🤝 Get vouched by others: +15 points

**Higher score = earlier ticket access!**""",

    "resale": """💰 **Smart Resale** on FanFirst protects fans from scalping.

**How it works:**
- Maximum markup: Usually 120% of original price
- Artist royalty: 10% on every resale
- All resales tracked on blockchain

You can sell tickets, but not at crazy scalper prices!""",

    "help": """👋 **Welcome to FanFirst Support!**

I can help with:
- 🎫 **Tickets** - Buying, refunds, transfers
- 🎵 **Events** - Find concerts, games, shows
- 👤 **Account** - Wallet, profile, Fandom Score
- ❓ **FAQ** - How FanFirst works

Just ask your question and I'll route you to the right agent!""",
}

DEFAULT_FAQ = """👋 **FanFirst Support**

**Quick answers:**
- 🎫 **Buy tickets:** Browse at /events
- 💰 **Refunds:** Dashboard → My Tickets
- 🔗 **Connect wallet:** Click "Connect Wallet" in header
- 📊 **Fandom Score:** Earn by attending events & taking quizzes

**Learn more:**
- About FanFirst: /about
- All events: /events
- Your dashboard: /dashboard

What else can I help with?"""


def find_cached_response(message: str) -> str | None:
    msg_lower = message.lower()
    for key, response in FAQ_CACHE.items():
        if key in msg_lower:
            return response
    return None


class FAQAgent:
    """FAQ with cached responses + LLM fallback"""
    
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
                    print(f"[FAQAgent] Failed to init LLM: {e}")
        return self._llm
    
    async def stream_response(
        self, 
        message: str, 
        history: List[Dict]
    ) -> AsyncGenerator[str, None]:
        
        # Check cache first
        cached = find_cached_response(message)
        if cached:
            for i in range(0, len(cached), 15):
                yield cached[i:i+15]
            return
        
        # Try LLM
        if self.llm:
            try:
                prompt = f"""You are FAQ support for FanFirst NFT ticketing.
Be brief, helpful, use emojis sparingly.

User: {message}

Reply (2-3 sentences):"""
                
                async for chunk in self.llm.astream([HumanMessage(content=prompt)]):
                    if chunk.content:
                        yield chunk.content
                return
            except Exception as e:
                print(f"[FAQAgent] LLM error: {e}")
        
        # Fallback
        for i in range(0, len(DEFAULT_FAQ), 15):
            yield DEFAULT_FAQ[i:i+15]
