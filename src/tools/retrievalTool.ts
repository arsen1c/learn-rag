import { tool } from "langchain";
import { z } from "zod";
import { ChromaService } from "../service/Chroma";

// TODO: Helper function to detect vague queries

const retrievalTool = tool(
    async ({
        query
    }: { query: string }) => {
        console.log("\n>>> RETRIEVAL TOOL CALLED with query:", query);
        // vectorStore instance
        const vectorStore = await ChromaService.fromExistingCollection()

        const retrievedDocs = await vectorStore.similaritySearch(query, 3)

        // serialize the retrivedDocs into [{Source, Content}] format
        const serializedContent = retrievedDocs
            .map(doc => `Source: ${doc.metadata.source}\nContent: ${doc.pageContent}`)
            .join("\n\n---\n\n")

        return serializedContent
    },
    {
        name: "retrieve",
        description: `Retrieve information related to a query. Use this tool when you need to search for factual information in the knowledge base.

IMPORTANT: The query parameter must be a complete, specific search query. 
- For follow-up questions, combine the context from previous messages with the current question.
- Example: If previous context mentions "Microsoft was founded in 1975" and user asks "by whom?", 
  use query "who founded Microsoft" or "Microsoft founders", NOT vague queries like "something created by whom".
- Always make queries specific and complete.`,
        schema: z.object({
            query: z.string()
                .min(3, "Query must be at least 3 characters")
                .describe("A complete, specific search query. Must be clear and unambiguous. For follow-up questions, include context from previous messages to make the query complete.")
        }),
    }
)

export default retrievalTool