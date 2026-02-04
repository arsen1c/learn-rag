import * as readline from "node:readline/promises"
import { stdin as input, stdout as output } from "process"


export async function getQuestion(queryPrompt: string = "Query: "): Promise<string> {
    const rl = readline.createInterface({ input, output })
    const userInput = await rl.question(queryPrompt) as string

    rl.close()

    return userInput
}