# Ticket Support Agent - With proper keyword priority
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage
from typing import List, Dict, Any, AsyncGenerator
import os

# Ordered list of responses - more specific keywords first!
TICKET_KEYWORDS = [
    # Specific keywords first (order matters!)
    ("cancel", """❌ **Ticket Cancellation**

- **Event cancelled by organizer:** Full automatic refund
- **Want to cancel your purchase:** Refunds available within 48hrs
- **Can't attend anymore:** List for resale instead!

**To request cancellation/refund:**
1. Go to Dashboard → My Tickets
2. Select your ticket
3. Click "Request Refund" or "List for Sale"

Need help? Email support@fanfirst.com"""),

    ("refund", """💰 **Refund Policy**

Refunds are available if:
- Event is cancelled → Full refund automatically
- Event postponed → Option to refund or keep ticket
- Within 48 hours of purchase → Full refund minus gas fees

**To request:** Dashboard → My Tickets → Select ticket → "Request Refund"

Need help with a specific ticket? Share your ticket ID!"""),

    ("transfer", """🔄 **Ticket Transfer**

To transfer your NFT ticket:
1. Go to Dashboard → My Tickets
2. Click on the ticket
3. Choose "Transfer"
4. Enter recipient's wallet address
5. Confirm the transaction

**Note:** Transfer is free, but resale caps still apply!"""),

    ("qr code", """📱 **QR Code for Entry**

Your QR code:
1. Go to Dashboard → My Tickets
2. Select the event ticket
3. Click "Show QR Code"
4. Show at venue entrance

**Pro tip:** Save a screenshot for offline!
QR activates 24 hours before event."""),

    ("qr", """📱 **QR Code for Entry**

1. Dashboard → My Tickets
2. Select ticket → "Show QR"
3. Show at venue

Activates 24hrs before event!"""),

    ("resale", """💸 **Resale Your Ticket**

To list for resale:
1. Dashboard → My Tickets
2. Select ticket → "List for Sale"
3. Set price (max 120% of original)
4. Confirm listing

Artist gets 10% royalty on resales."""),

    ("resell", """💸 **Resale Your Ticket**

1. Dashboard → My Tickets → Select ticket
2. Click "List for Sale"
3. Set your price (capped at 120% of original)

This prevents scalping while letting you recover costs!"""),

    ("buy", """🎫 **How to Buy Tickets**

1. Browse events at /events
2. Select an event you love
3. Complete the FanIQ Quiz (proves you're a real fan!)
4. Connect your wallet
5. Purchase your NFT ticket

Tickets are minted directly to your wallet!"""),

    ("purchase", """🎫 **How to Purchase Tickets**

1. Go to /events and find your event
2. Click "Get Tickets"
3. Pass the FanIQ Quiz (verifies real fans)
4. Connect wallet & complete payment
5. NFT ticket appears in your wallet!"""),

    ("where", """🎫 **Where to Get Tickets**

Browse all available events at **/events**

1. Find your event
2. Pass the FanIQ Quiz
3. Connect wallet & purchase

Your NFT ticket will be in your wallet!"""),

    ("how", """🎫 **How Tickets Work**

1. Browse: /events
2. Prove you're a fan: FanIQ Quiz
3. Connect wallet: MetaMask or Phantom
4. Purchase: NFT minted to your wallet
5. Attend: Show QR at venue

Need specific help? Ask about refunds, transfers, or QR codes!"""),
]


def find_ticket_response(message: str) -> str | None:
    """Find matching ticket response - checks in priority order"""
    msg_lower = message.lower()
    
    for keyword, response in TICKET_KEYWORDS:
        if keyword in msg_lower:
            return response
    
    return None


DEFAULT_TICKET_RESPONSE = """🎫 **Ticket Support**

I can help with:
- 💰 **Refunds** - Request within 48 hours
- ❌ **Cancellations** - Cancel or list for resale
- 🔄 **Transfers** - Send to another wallet
- 📱 **QR Codes** - Get your entry code
- 💸 **Resale** - List your ticket for sale

**Quick links:**
- View tickets: Dashboard → My Tickets
- Browse events: /events
- Contact: support@fanfirst.com

What specifically do you need help with?"""


class TicketAgent:
    """Ticket support with keyword priority matching"""
    
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
                    print(f"[TicketAgent] LLM init failed: {e}")
        return self._llm
    
    async def stream_response(
        self, 
        message: str, 
        history: List[Dict], 
        db=None,
        user_id: str = None
    ) -> AsyncGenerator[str, None]:
        """Stream response with proper keyword matching"""
        
        # Check cached responses (instant, priority ordered)
        cached = find_ticket_response(message)
        if cached:
            # Simulate typing for smoother UX
            for i in range(0, len(cached), 20):
                yield cached[i:i+20]
            return
        
        # Try LLM for uncached queries
        if self.llm:
            try:
                prompt = f"""You are Ticket Support for FanFirst.
Help with: purchases, refunds, cancellations, transfers, QR codes, resale.
Be brief (2-3 sentences), friendly, use emojis sparingly.

User question: {message}

Your helpful response:"""
                
                async for chunk in self.llm.astream([HumanMessage(content=prompt)]):
                    if chunk.content:
                        yield chunk.content
                return
            except Exception as e:
                print(f"[TicketAgent] LLM error: {e}")
        
        # Ultimate fallback
        for i in range(0, len(DEFAULT_TICKET_RESPONSE), 20):
            yield DEFAULT_TICKET_RESPONSE[i:i+20]
