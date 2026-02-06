import { createAgent, summarizationMiddleware } from "langchain";
import { MemorySaver } from "@langchain/langgraph";
import { ChatGroq } from "@langchain/groq";

const checkpointer = new MemorySaver();

/**
 * - Create a model
 * - Create an agent
 * - Invoke the agent with the messages object
 */
const model = new ChatGroq({
    model: "llama-3.1-8b-instant"
})

const agent = createAgent({
    model,
    tools: [],
    middleware: [
        summarizationMiddleware({
            model,
            trigger: { tokens: 4000 },
            keep: { messages: 20 },
        }),
    ],
    checkpointer,
});

const config = { configurable: { thread_id: "1" } };
await agent.invoke({ messages: "hi, my name is bob" }, config);
await agent.invoke({ messages: "hi, my name is arsenic" }, config);
await agent.invoke({ messages: "write a short poem about cats" }, config);
await agent.invoke({ messages: "now do the same but for dogs" }, config);
const finalResponse = await agent.invoke({ messages: "what's my name?" }, config);

console.log(finalResponse.messages.at(-1)?.content);