/**
 * - How the Retriever magically fetches the chunks that are
 *  sementically accurate
 * - How itt uses this user query vector embedding and the 
 *   original document vector embedding
 * - How the matching is being done
 * 
 * 
 * Basically it goes through every single chunk and assigns
 *  a similarty score between 0 -> 1.
 *  1 being the max similarty and 0 being the least
 * 
 * - So how exactly is this score calculate? 
 * 
 * 
 * STEPS:
 * 1. Load existing Chroma Collection
 * 2. Do semantic search (k=5)
 * 3. Build a prompt from retrieved chunks
 * 4. Send to chat model
 * 5. Print the answer
 */

import { createAgent, SystemMessage } from "langchain"
import { retrievalTool } from "./tools"
import { getQuestion } from "./utils/readquestion"
import { ChatGroq } from "@langchain/groq"

const tools = [retrievalTool]
const systemPrompt = new SystemMessage(`
You are a helpful AI assistant with access to a knowledge retrieval tool.

When a user asks a question that requires factual information,
you MUST call the "retrieve" tool to get relevant context.

Use ONLY the information returned by the tool to answer.
If the tool does not return relevant information, say you don't have enough information.

Do NOT make up answers.
Always prefer calling the tool before answering.
`);

const model = new ChatGroq({
    model: "llama-3.1-8b-instant"
})

const agent = createAgent({
    model,
    tools,
    systemPrompt
})

async function main() {
    while (true) {
        const userInput = await getQuestion()

        if (userInput === "/bye") break

        // const results = await vectorStore.similaritySearch(userInput, 2)

        const agentInputs = {
            messages: [{ role: "user", content: userInput }],
        };

        const stream = await agent.stream(agentInputs, {
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

    }
}

main()