import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Client, Collection, GatewayIntentBits, Events } from "discord.js";
import dotenv from "dotenv";

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

client.commands = new Collection();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const commandsPath = path.join(__dirname, "commands");

async function loadCommands(directory) {
  const files = fs.readdirSync(directory, { withFileTypes: true });
  for (const file of files) {
    const filePath = path.join(directory, file.name);
    if (file.isDirectory()) {
      await loadCommands(filePath);
    } else if (file.isFile() && file.name.endsWith(".js")) {
      try {
        const command = await import(filePath);
        if (command.data && command.execute) {
          client.commands.set(command.data.name, command);
          console.log(`Command loaded: ${command.data.name}`);
        } else {
          console.log(
            `[WARNING] Command at ${filePath} is missing 'data' or 'execute'.`,
          );
        }
      } catch (error) {
        console.error(`Failed to load command at ${filePath}:`, error);
      }
    }
  }
}

client.once(Events.ClientReady, async () => {
  console.log(`Logged in as ${client.user.tag}`);
  await loadCommands(commandsPath);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isCommand()) return;
  const command = client.commands.get(interaction.commandName);
  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }
  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: "There was an error while executing this command!",
      ephemeral: true,
    });
  }
});

client.login(process.env.TOKEN);
