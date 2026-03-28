from typing import TypedDict, List

class AgentState(TypedDict):
    query: str
    keywords: str
    persona: str
    language: str
    follow_up: str        # for multi-turn News Navigator
    retrieved_docs: List[str]
    final_output: str
    next_step: str