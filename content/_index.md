+++
# The home page. The text below appears under your name; the post list and
# contact links are added by templates/index.html.
+++

I build production AI agents in Rust: the agent loop, its tools and state,
the MCP and A2A integrations around it, and the tracing that shows what it
did. Before that I spent ten years on backend and data systems, from Big Data
platforms at Intel to event-driven Scala services. I'm now adding Python AI
engineering to the stack.

I write here about what that takes in practice. If you are building agents
and want help, get in touch.

## What I work on

- **AI agents in Rust.** The core backend of an AI assistant for recruiters: agentic tool-use loop, multi-turn conversation state, PostgreSQL persistence.
- **Agent-to-UI (A2UI).** Letting the LLM build interactive views and custom components inside a chat interface.
- **Observability for agents.** Distributed tracing (OpenTelemetry) and LLM observability (MLflow GenAI traces) across the full agent stack.
- **Multi-agent systems.** AI agents that work together over the A2A (Agent-to-Agent) protocol, and tools that measure how a prompt or tool change affects an agent whose output varies from run to run.
