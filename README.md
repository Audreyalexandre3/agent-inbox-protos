# Agent Inbox prototypes

Two throwaway prototypes of the agentic inbox V1 for January (fake data, brand "Halden & Co"). Scenario: the user comes back after 3 days, 200 suggestions wait, including 3 leads and 150 spams. 2 agents (Lead gen, General), suggestions only, actions reply/like/hide/delete.

- `a.html` Light hub: home page with a return summary, leads first, other intents grouped with bulk, history and agent instructions.
- `b.html` Tab per agent: "Engagement" nav entry, one tab per agent (suggestions filterable by intent, history, instructions).

Shared engine in `core.js` (state, actions, live feed, detail drawer, log) and `data.js` (fake items). No build step.
