import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { clientId, guildId, token } from "./config.json";

const commands = [];
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const commandsPath = path.join(__dirname, "commands");

fs.readdirSync(commandsPath).forEach(async (dir) => {
  const commandFiles = fs
    .readdirSync(path.join(commandsPath, dir))
    .filter((file) => file.endsWith(".js"));

  for (const file of commandFiles) {
    const command = await import(`./commands/${dir}/${file}`);
    commands.push(command.data.toJSON());
  }
});

const rest = new REST({ version: "9" }).setToken(token);

(async () => {
  try {
    console.log("Started refreshing application (/) commands.");
    await rest.put(Routes.applicationCommands(clientId), { body: commands });
    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error(error);
  }
})();
