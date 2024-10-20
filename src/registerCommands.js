import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const configPath = path.join(__dirname, "config.json");
const rawData = fs.readFileSync(configPath);
const { clientId, guildId, token } = JSON.parse(rawData);

const commands = [];
const commandsPath = path.join(__dirname, "commands/utility/functionalities");

// Función recursiva para leer todos los archivos .js en subdirectorios
function readCommandFiles(directory) {
  const entries = fs.readdirSync(directory, { withFileTypes: true });
  const commandFiles = [];

  for (const entry of entries) {
    const resPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      commandFiles.push(...readCommandFiles(resPath)); // Recursividad para subdirectorios
    } else if (entry.isFile() && entry.name.endsWith(".js")) {
      commandFiles.push(resPath);
    }
  }

  return commandFiles;
}

const commandFiles = readCommandFiles(commandsPath);
console.log(`All command files found: ${commandFiles.join(", ")}`);

for (const filePath of commandFiles) {
  console.log(`Loading command from ${filePath}`);
  try {
    const commandModule = await import(filePath);
    if (commandModule.data) {
      commands.push(commandModule.data.toJSON());
      console.log(`Command loaded successfully: ${filePath}`);
    } else {
      console.error(`Command data not found in ${filePath}`);
    }
  } catch (error) {
    console.error(`Error importing command from ${filePath}: ${error}`);
  }
}

const rest = new REST({ version: "9" }).setToken(token);

(async () => {
  try {
    console.log("Started refreshing application (/) commands.");
    console.log(
      "Commands being registered:",
      JSON.stringify(commands, null, 2),
    );
    await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
      body: commands,
    });
    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error("Failed to reload commands:", error);
  }
})();
