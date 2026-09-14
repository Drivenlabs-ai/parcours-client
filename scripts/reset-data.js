import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { createStore } from "../backend/store.js";

let confirmed = process.argv.includes("--yes");
if (!confirmed && stdin.isTTY) {
  const prompt = createInterface({ input: stdin, output: stdout });
  const answer = await prompt.question(
    "Remplacer les tickets de CETTE copie par les trois exemples fictifs ? [oui/non] ",
  );
  prompt.close();
  confirmed = answer.trim().toLowerCase() === "oui";
}
if (confirmed) {
  createStore().reset();
  console.log(
    "Données de cette copie réinitialisées. Aucun fichier Git n’a changé.",
  );
} else {
  console.log(
    "Aucune donnée modifiée. Pour confirmer : npm run reset-data -- --yes",
  );
}
