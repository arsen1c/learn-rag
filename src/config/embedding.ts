import { OllamaEmbeddings } from "@langchain/ollama";

// set ollama's nomic-embed-text model as the embedding model
export const embeddings = new OllamaEmbeddings({
    model: "nomic-embed-text",
    baseUrl: "http://127.0.0.1:11434"
})