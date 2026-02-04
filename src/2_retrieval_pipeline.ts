import * as readline from "node:readline/promises"
import { stdin as input, stdout as output } from "process"
import { ChromaService } from "./service/Chroma"

async function main() {
    const vectorStore = await ChromaService.fromExistingCollection()

    while (true) {
        const rl = readline.createInterface({ input, output })
        const userInput = await rl.question("Query: ")

        if (userInput === "/bye") break

        const results = await vectorStore.similaritySearch(userInput, 2)

        console.log(`\nTop matches:\n`)
        results.forEach((doc, i) => {
            console.log(`Result ${i + 1}`)
            console.log(doc.pageContent)
            console.log("---")
        })

        rl.close()
    }

}

main()