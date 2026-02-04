import { tool } from "langchain";
import { z } from "zod";
import { ChromaService } from "../service/Chroma";

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
        description: "Retrieve information related to a query. Use this tool when you need to search for factual information in the knowledge base.",
        schema: z.object({
            query: z.string().describe("The search query to retrieve relevant information from the knowledge base.")
        }),
    }
)

export default retrievalTool