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