import { SlashCommandBuilder } from "discord.js";
import { getVoiceConnection } from "@discordjs/voice";

export const data = new SlashCommandBuilder().setName("leave").setDescription("Leaves the voice channel");

export async function execute(interaction){
    const guildId = interaction.guild.id;
    const connection = getVoiceConnection(guildId);

    if(connection){
        connection.destroy();
        await interaction.reply("Left the voice channel.");
    } else {
        await interaction.reply("Im not in a voice channel!");
    }
}