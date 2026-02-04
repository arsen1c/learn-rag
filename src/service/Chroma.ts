import { Chroma } from "@langchain/community/vectorstores/chroma";
import { Document } from "langchain";
import { chromaConfig } from "../config/chroma";
import { embeddings } from "../config/embedding";

export const ChromaService = {
    fromDocuments: async (chunks: Document[]) =>
        Chroma.fromDocuments(chunks, embeddings, chromaConfig),
    fromExistingCollection: async () =>
        Chroma.fromExistingCollection(embeddings, chromaConfig),

}