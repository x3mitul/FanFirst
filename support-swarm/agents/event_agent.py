# Event Agent - With robust fallbacks
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage
from typing import List, Dict, AsyncGenerator
import os

# Sample events
SAMPLE_EVENTS = """🎫 **Upcoming Events**

🏀 **LA Lakers vs Boston Celtics**
   📅 March 15, 2025 | 📍 Crypto.com Arena | 🎟️ Available

🎤 **Taylor Swift - Eras Tour**
   📅 April 10, 2025 | 📍 SoFi Stadium | 🎟️ Limited

🎵 **Drake Concert**
   📅 May 5, 2025 | 📍 Staples Center | 🎟️ Available

🎭 **Hamilton - Broadway Tour**
   📅 June 20, 2025 | 📍 Dolby Theatre | 🎟️ On Sale Soon

Browse all events at **/events**"""

EVENT_RESPONSES: Dict[str, str] = {
    "lakers": """🏀 **LA Lakers Events**

📅 **Next Game:** LA Lakers vs Boston Celtics
📍 **Venue:** Crypto.com Arena, Los Angeles
🗓️ **Date:** March 15, 2025
🎟️ **Tickets:** Starting at $125

Browse all Lakers games at /events?search=lakers""",

    "taylor": """🎤 **Taylor Swift - Eras Tour**

📅 **Date:** April 10, 2025
📍 **Venue:** SoFi Stadium, Los Angeles
🎟️ **Tickets:** Limited availability!

Get tickets at /events before they sell out!""",

    "drake": """🎵 **Drake Concert**

📅 **Date:** May 5, 2025
📍 **Venue:** Staples Center
🎟️ **Tickets:** Available

Buy at /events?search=drake""",

    "upcoming": SAMPLE_EVENTS,
    "events": SAMPLE_EVENTS,
    "what": SAMPLE_EVENTS,
    "when": SAMPLE_EVENTS,
    "show": SAMPLE_EVENTS,
}


def find_event_response(message: str) -> str | None:
    msg_lower = message.lower()
    for key, response in EVENT_RESPONSES.items():
        if key in msg_lower:
            return response
    return None


class EventAgent:
    """Event info with fallbacks"""
    
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
                    print(f"[EventAgent] Failed to init LLM: {e}")
        return self._llm
    
    async def stream_response(
        self, 
        message: str, 
        history: List[Dict], 
        db=None
    ) -> AsyncGenerator[str, None]:
        
        cached = find_event_response(message)
        if cached:
            for i in range(0, len(cached), 15):
                yield cached[i:i+15]
            return
        
        if self.llm:
            try:
                prompt = f"""You are Event Info for FanFirst.
Available: Lakers games, Taylor Swift, Drake concert, Hamilton.
Be brief.

User: {message}

Reply:"""
                
                async for chunk in self.llm.astream([HumanMessage(content=prompt)]):
                    if chunk.content:
                        yield chunk.content
                return
            except Exception as e:
                print(f"[EventAgent] LLM error: {e}")
        
        for i in range(0, len(SAMPLE_EVENTS), 15):
            yield SAMPLE_EVENTS[i:i+15]
