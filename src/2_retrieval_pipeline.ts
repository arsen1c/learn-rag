import { ChromaService } from "./service/Chroma"
import { getQuestion } from "./utils/readquestion"

async function main() {
    const vectorStore = await ChromaService.fromExistingCollection()

    while (true) {
        const userInput = await getQuestion()

        if (userInput === "/bye") break

        const results = await vectorStore.similaritySearch(userInput, 2)

        console.log(`\nTop matches:\n`)
        results.forEach((doc, i) => {
            console.log(`Result ${i + 1}`)
            console.log(doc.pageContent)
            console.log("---")
        })
    }
}

main()

// Synthetic Questions: 
// 1. "What was NVIDIA's first graphics accelerator called?"
// 2. "Which company did NVIDIA acquire to enter the mobile processor market?"
// 3. "What was Microsoft's first hardware product release?"
// 4. "How much did Microsoft pay to acquire GitHub?"
// 5. "In what year did Tesla begin production of the Roadster?"
// 6. "Who succeeded Ze'ev Drori as CEO in October 2008?"
// 7. "What was the name of the autonomous spaceport drone ship that achieved the first successful sea landing?"
// 8. "What was the original name of Microsoft before it became Microsoft?"