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
    const config = {
        configurable: {
            thread_id: "main-conversation" // Change this to create different conversation threads
        }
    };

    while (true) {
        const userInput = await getQuestion()

        if (userInput === "/bye") break

        // pass config as the second argument to maintain history!
        // without it, each invoke() call starts a fresh conversation
        const response = await agent.invoke({
            messages: [{
                role: "user", content: userInput
            }]
        }, config) // pass config here to maintain conversation history

        console.log("\n\nAI Answer:", response.messages.at(-1)?.content) // get the last item i.e the final AI message
    }
}

main()