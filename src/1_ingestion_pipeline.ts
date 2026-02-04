import { TextLoader } from "@langchain/classic/document_loaders/fs/text"
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters"
import path from "path"
import { Chroma } from "@langchain/community/vectorstores/chroma"
import { chromaConfig } from "./config/chroma"
import { embeddings } from "./config/embedding"

/**
 * Steps
 * 1. Load the file (text, pdf etc) into the Loader
 *      - Loader will load the file, returns the id, metadata & pageContent
 * 2. Split the documents into small chunks
 *      - Spliiter will split the whole document into chunks based on the chunkSize we pass in the splitter
 * 3. Add the splits into the Vector to create a vector entry
 * 
 * We will need the following
 * - Chat model
 * - Embedding model
 * - Vector store
 */



// const vectorStore = new MemoryVectorStore(embeddings);

/**
 * -------------- Load Documents --------------
 * 
 * Load all the documents in the docs folder
 */
// const folderPath = path.join(process.cwd(), "docs") // set the folder path

// Directory Loader
// async function loadDocuments(docsPath: string = folderPath) {
//     console.log(`Loading documents from ${docsPath}...`)

//     // throw an error if directory doesnt exist
//     if (!fs.existsSync(docsPath)) {
//         throw new Error(`Directory ${docsPath} does not exist.`)
//     }

//     // load all the files from the directory. specifically .txt
//     const loader = new DirectoryLoader(docsPath, {
//         ".txt": (p) => new TextLoader(p)
//     })

//     const documents = await loader.load() // load the directoryloader. each document will have these keys [ "pageContent", "metadata", "id" ]
//     console.log(`Total documents loaded: ${documents.length}`)

//     if (documents.length === 0) throw new Error(`No .txt files found in ${docsPath}`)

//     // Print metadata about 1st 2 documents
//     documents.forEach((doc, i) => {
//         console.log(`Document ${i + 1}`)
//         console.log(`Source: ${doc.metadata.source}\n`)
//     })

//     // return the documents chunks to be loaded in the embedding model
//     return documents
// }

// await loadDocuments()

// Single file loader
async function loadDocuments() {
    // can change the end file name
    const fileName = path.join(process.cwd(), "docs", "Microsoft.txt")

    const loader = new TextLoader(fileName)
    const documents = await loader.load()

    return documents
}


/**
 * -------------- Split Documents --------------
 */
async function splitDocuments(documents: any[]) {
    console.log(`Splitting documents into chunks...`)

    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1500, // split into 1k chunks each
        chunkOverlap: 200
    })

    const chunks = await splitter.splitDocuments(documents) // splits the document into chunks based on the chunkSize

    chunks.slice(0, 5).forEach((chunk, i) => {
        console.log(`--- Chunk ${i + 1} ---`)
        console.log(`Source: ${chunk.metadata.source}`)
    })

    return chunks
}


/**
 * -------------- Create Vector Store --------------
 */
async function createVectorStore(chunks: any[]) {
    // inspect chunk
    const vecquery = await embeddings.embedQuery(chunks[0].pageContent)
    console.log(vecquery.slice(0, 10)) // print 10 embeds

    const vectorStore = await Chroma.fromDocuments(chunks, embeddings, chromaConfig);

    console.log("Vector store created")

    return vectorStore
}

/**
 * -------------- Main pipeline --------------
 */
async function main() {
    console.log("=== RAG Ingestion Pipeline ===\n");

    const documents = await loadDocuments();
    const chunks = await splitDocuments(documents);
    await createVectorStore(chunks);

    console.log("\nIngestion complete!");
}

main();