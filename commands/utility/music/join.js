import { SlashCommandBuilder } from "discord.js";
import { joinVoiceChannel } from "@discordjs/voice";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("join")
    .setDescription("Joins a voice channel"),
  async execute(interaction) {
    const channel = interaction.member.voice.channel;
    if (channel) {
      const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
      });
      await interaction.reply(`Joined to ${channel}`);
    } else {
      await interaction.reply(
        "You need to be in a voice channel for me to join!",
      );
    }
  },
};
