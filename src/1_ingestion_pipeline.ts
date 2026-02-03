import { TextLoader } from "@langchain/classic/document_loaders/fs/text"
import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory"
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf"
import { ChatOpenAI } from "@langchain/openai"
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters"
import path from "path"

/**
 * Steps
 * 1. Load the file (text, pdf etc) into the Loader
 *      - Loader will load the file, returns the id, metadata & pageContent
 * 2. Pass this loaded doc into the splitter
 *      - Spliiter will split the whole document into chunks based on the chunkSize we pass in the splitter
 * 3. Add the splits into the Vector to create a vector entry
 * 
 * We will need the following
 * - Chat model
 * - Embedding model
 * - Vector store
 */


const embeddings = new HuggingFaceInferenceEmbeddings({
    model: "sentence-transformers/all-mpnet-base-v2",
    apiKey: process.env.HF_API_KEY
})
console.log(process.env.HF_API_KEY)

const vectorStore = new MemoryVectorStore(embeddings);

const filepath = path.join(process.cwd(), "docs", "Google.txt")

const loader = new TextLoader(filepath)

const docs = await loader.load()
// console.log(docs[0]?.pageContent.slice(0, 10))
// console.log(docs[0]?.metadata)

const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200
})

const allSplits = await splitter.splitDocuments(docs)
console.log(JSON.stringify(allSplits[0], null, 2))

await vectorStore.addDocuments(allSplits)

const retrieved = await vectorStore.similaritySearch("How much google paid to the UK in settlement?", 2)

console.log(retrieved)

