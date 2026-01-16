# Customer Support Swarm - FastAPI Main Server
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
import uuid
import os
from dotenv import load_dotenv
from contextlib import asynccontextmanager

# Load ALL environment files (order matters - .env.local overrides .env)
parent_dir = os.path.dirname(os.path.dirname(__file__))
load_dotenv(os.path.join(parent_dir, '.env'))
load_dotenv(os.path.join(parent_dir, '.env.local'), override=True)

# Also try current working directory
load_dotenv('.env')
load_dotenv('.env.local', override=True)

# Set for agents to use
GEMINI_KEY = os.getenv("GEMINI_API_KEY")
print(f"[Support Swarm] GEMINI_API_KEY: {'SET ✓' if GEMINI_KEY else 'NOT SET ✗'}")
if GEMINI_KEY:
    print(f"[Support Swarm] Key starts with: {GEMINI_KEY[:10]}...")

# Import agents AFTER loading env
from db import init_db
from agents import RouterAgent, TicketAgent, EventAgent, AccountAgent, FAQAgent

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    print("✅ Customer Support Swarm initialized!")
    yield

app = FastAPI(
    title="Customer Support Swarm",
    description="Multi-agent AI support for FanFirst",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize agents
router_agent = RouterAgent()
ticket_agent = TicketAgent()
event_agent = EventAgent()
account_agent = AccountAgent()
faq_agent = FAQAgent()

# In-memory storage
conversations: Dict[str, List[Dict]] = {}


class ChatMessage(BaseModel):
    message: str
    conversation_id: Optional[str] = None
    user_id: Optional[str] = None
    visitor_id: Optional[str] = None


class ChatResponse(BaseModel):
    conversation_id: str
    agent_type: str
    agent_description: str
    content: str


@app.get("/")
async def root():
    return {
        "service": "Customer Support Swarm",
        "status": "running",
        "gemini_key": "set" if os.getenv("GEMINI_API_KEY") else "missing",
        "agents": ["router", "ticket", "event", "account", "faq"]
    }


@app.get("/health")
async def health():
    return {"status": "healthy", "gemini": bool(os.getenv("GEMINI_API_KEY"))}


def get_or_create_conversation(conversation_id: Optional[str], visitor_id: str) -> str:
    if conversation_id and conversation_id in conversations:
        return conversation_id
    new_id = conversation_id or str(uuid.uuid4())
    conversations[new_id] = []
    return new_id


def save_message(conversation_id: str, role: str, content: str, agent_type: str = None):
    if conversation_id not in conversations:
        conversations[conversation_id] = []
    conversations[conversation_id].append({
        "role": role, "content": content, "agent_type": agent_type
    })


def get_history(conversation_id: str) -> List[Dict]:
    return conversations.get(conversation_id, [])


@app.websocket("/ws/chat")
async def websocket_chat(websocket: WebSocket):
    await websocket.accept()
    connection_id = str(uuid.uuid4())
    print(f"🔌 Connected: {connection_id}")
    
    try:
        while True:
            data = await websocket.receive_json()
            message = data.get("message", "")
            conversation_id = data.get("conversation_id")
            visitor_id = data.get("visitor_id", f"anon_{uuid.uuid4().hex[:8]}")
            user_id = data.get("user_id")
            
            if not message:
                continue
            
            conversation_id = get_or_create_conversation(conversation_id, visitor_id)
            save_message(conversation_id, "user", message)
            history = get_history(conversation_id)
            
            # Route
            agent_type, routing_msg = await router_agent.classify(message)
            agent_desc = router_agent.get_agent_description(agent_type)
            
            await websocket.send_json({
                "type": "routing",
                "conversation_id": conversation_id,
                "agent_type": agent_type,
                "agent_description": agent_desc,
                "message": routing_msg
            })
            
            # Stream response
            full_response = ""
            
            try:
                if agent_type == "ticket":
                    async for chunk in ticket_agent.stream_response(message, history, None, user_id):
                        full_response += chunk
                        await websocket.send_json({"type": "stream", "content": chunk, "agent_type": agent_type})
                elif agent_type == "event":
                    async for chunk in event_agent.stream_response(message, history, None):
                        full_response += chunk
                        await websocket.send_json({"type": "stream", "content": chunk, "agent_type": agent_type})
                elif agent_type == "account":
                    async for chunk in account_agent.stream_response(message, history, None, user_id):
                        full_response += chunk
                        await websocket.send_json({"type": "stream", "content": chunk, "agent_type": agent_type})
                else:
                    async for chunk in faq_agent.stream_response(message, history):
                        full_response += chunk
                        await websocket.send_json({"type": "stream", "content": chunk, "agent_type": agent_type})
                        
            except Exception as e:
                print(f"❌ Agent error: {e}")
                import traceback
                traceback.print_exc()
                full_response = f"Sorry, I encountered an issue. Please try rephrasing your question."
                await websocket.send_json({"type": "stream", "content": full_response, "agent_type": agent_type})
            
            save_message(conversation_id, "assistant", full_response, agent_type)
            await websocket.send_json({"type": "complete", "conversation_id": conversation_id, "agent_type": agent_type})
    
    except WebSocketDisconnect:
        print(f"🔌 Disconnected: {connection_id}")
    except Exception as e:
        print(f"❌ WebSocket error: {e}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
