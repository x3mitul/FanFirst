# Router Agent - Optimized with keyword routing + LLM fallback
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.messages import HumanMessage
from typing import Literal, Tuple, Dict
import os
import re

AgentType = Literal["ticket", "event", "account", "faq"]

# Keyword-based routing (instant, no API call)
KEYWORD_ROUTES: Dict[str, AgentType] = {
    # Ticket keywords
    "refund": "ticket",
    "ticket": "ticket",
    "purchase": "ticket",
    "bought": "ticket",
    "qr code": "ticket",
    "qr": "ticket",
    "transfer": "ticket",
    "resale": "ticket",
    "resell": "ticket",
    "cancel": "ticket",
    "order": "ticket",
    
    # Event keywords
    "event": "event",
    "concert": "event",
    "show": "event",
    "when": "event",
    "date": "event",
    "venue": "event",
    "location": "event",
    "schedule": "event",
    "lakers": "event",
    "artist": "event",
    "perform": "event",
    
    # Account keywords
    "wallet": "account",
    "connect": "account",
    "profile": "account",
    "account": "account",
    "fandom score": "account",
    "score": "account",
    "spotify": "account",
    "login": "account",
    "sign in": "account",
    "password": "account",
    
    # FAQ keywords
    "what is": "faq",
    "how does": "faq",
    "how do": "faq",
    "explain": "faq",
    "help": "faq",
    "nft": "faq",
    "fanfirst": "faq",
    "policy": "faq",
    "about": "faq",
}


class RouterAgent:
    """Routes queries - keyword first, LLM fallback"""
    
    def __init__(self):
        self._llm = None  # Lazy load
    
    @property
    def llm(self):
        """Lazy load LLM only when needed"""
        if self._llm is None:
            self._llm = ChatGoogleGenerativeAI(
                model="gemini-1.5-flash",
                google_api_key=os.getenv("GEMINI_API_KEY"),
                temperature=0.1,
            )
        return self._llm
    
    def _keyword_classify(self, message: str) -> AgentType | None:
        """Fast keyword-based classification (no API call)"""
        msg_lower = message.lower()
        
        for keyword, agent_type in KEYWORD_ROUTES.items():
            if keyword in msg_lower:
                return agent_type
        
        return None  # No keyword match, need LLM
    
    async def classify(self, message: str) -> Tuple[AgentType, str]:
        """Classify with keyword routing first, LLM fallback"""
        
        # Try keyword routing first (instant)
        keyword_result = self._keyword_classify(message)
        if keyword_result:
            return keyword_result, f"[Fast route] → {self.get_agent_description(keyword_result)}"
        
        # Fallback to LLM for ambiguous queries
        try:
            prompt = f"""Classify this query for FanFirst support.
Reply with ONLY one word: ticket, event, account, or faq

Query: {message}

Answer:"""
            
            response = await self.llm.ainvoke([HumanMessage(content=prompt)])
            result = response.content.strip().lower()
            
            if "ticket" in result:
                return "ticket", "Routing to Ticket Support"
            elif "event" in result:
                return "event", "Routing to Event Info"
            elif "account" in result:
                return "account", "Routing to Account Help"
            else:
                return "faq", "Routing to FAQ"
                
        except Exception as e:
            print(f"[Router] LLM error: {e}, defaulting to FAQ")
            return "faq", "Routing to FAQ (fallback)"
    
    def get_agent_description(self, agent_type: AgentType) -> str:
        descriptions = {
            "ticket": "🎫 Ticket Support",
            "event": "🎵 Event Info",
            "account": "👤 Account Help",
            "faq": "❓ FAQ"
        }
        return descriptions.get(agent_type, "Support")
