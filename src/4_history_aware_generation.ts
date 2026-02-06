/**
 * Adding memory to the Agent
 */

import { createAgent, SystemMessage } from "langchain"
import { retrievalTool } from "./tools"
import { getQuestion } from "./utils/readquestion"
import { ChatGroq } from "@langchain/groq"
import { MemorySaver } from "@langchain/langgraph"

const tools = [retrievalTool]
const checkpointer = new MemorySaver()
const systemPrompt = new SystemMessage(`
You are a helpful AI assistant with access to a knowledge retrieval tool.

When a user asks a question that requires factual information,
you MUST call the "retrieve" tool to get relevant context.

IMPORTANT RULES:
1. If a user asks a follow-up question (like "by whom?", "when?", "where?"), 
   you MUST use the context from previous messages to create a complete, specific query.
   Example: If previous message was "Microsoft was founded in 1975" and user asks "by whom?",
   your query should be "who founded Microsoft" or "Microsoft founders", NOT vague queries like "something created by whom".

2. Always create specific, complete search queries. Never use vague or incomplete queries.

3. Use ONLY the information returned by the tool to answer.
4. If the tool does not return relevant information, say you don't have enough information.
5. Do NOT make up answers.
6. Always prefer calling the tool before answering.
`);

const model = new ChatGroq({
    model: "llama-3.1-8b-instant"
})

const agent = createAgent({
    model,
    tools,
    systemPrompt,
    checkpointer
})

async function main() {
    // Use a consistent thread_id to maintain conversation history
    const config = { configurable: { thread_id: "main-conversation" } };

    while (true) {
        const userInput = await getQuestion()

        if (userInput === "/bye") break

        // const results = await vectorStore.similaritySearch(userInput, 2)

        const agentInputs = {
            messages: [{ role: "user", content: userInput }],
        };

        try {
            const stream = await agent.stream(agentInputs, {
                ...config,
                streamMode: "values",
            });

            for await (const step of stream) {
                const lastMessage = step.messages[step.messages.length - 1];
                if (!lastMessage) continue;

                // Get message type from constructor name (HumanMessage -> human, AIMessage -> ai, etc.)
                // const messageType = lastMessage.constructor.name.replace('Message', '').toLowerCase();
                console.log(`[${lastMessage.constructor.name}]: ${lastMessage.content}`);
                console.log("-----\n");
            }
        } catch (error: any) {
            // Handle tool calling errors gracefully
            if (error?.status === 400 && error?.error?.code === "tool_use_failed") {
                console.error("\n️  Error: Failed to call tool. The query may be too vague or malformed.");
                console.error(" Tip: Try asking a more complete question, or add context to your follow-up question.\n");

                // Try to extract the failed query from the error
                const failedGeneration = error?.error?.failed_generation;
                if (failedGeneration) {
                    console.error(`Failed query: ${failedGeneration}\n`);
                }
            } else {
                // Re-throw other errors
                console.error("Error:", error);
                throw error;
            }
        }

    }
}

main()