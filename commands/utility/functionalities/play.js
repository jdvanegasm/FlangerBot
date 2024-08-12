import { SlashCommandBuilder } from "discord.js";
import {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  NoSubscriberBehavior,
} from "@discordjs/voice";
import ytdl from "ytdl-core";

export const data = new SlashCommandBuilder()
  .setName("play")
  .setDescription("Joins a voice channel and plays music from YouTube")
  .addStringOption((option) =>
    option
      .setName("url")
      .setDescription("The URL of the YouTube video")
      .setRequired(true),
  );

export async function execute(interaction) {
  const channel = interaction.member.voice.channel;
  if (!channel) {
    return interaction.reply(
      "You need to be in a voice channel to play music!",
    );
  }

  const permissions = channel.permissionsFor(interaction.client.user);
  if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
    return interaction.reply(
      "I need permissions to join and speak in your voice channel!",
    );
  }

  const songUrl = interaction.options.getString("url");
  const connection = joinVoiceChannel({
    channelId: channel.id,
    guildId: interaction.guild.id,
    adapterCreator: interaction.guild.voiceAdapterCreator,
  });

  const stream = ytdl(songUrl, { filter: "audioonly" });
  const resource = createAudioResource(stream);
  const player = createAudioPlayer({
    behaviors: {
      noSubscriber: NoSubscriberBehavior.Play,
    },
  });

  player.play(resource);
  connection.subscribe(player);

  player.on(AudioPlayerStatus.Playing, () => {
    console.log("Playing music...");
    interaction.reply(`Playing: ${songUrl}`);
  });

  player.on(AudioPlayerStatus.Idle, () => {
    console.log("Playback finished.");
    connection.destroy();
  });

  player.on("error", (error) => {
    console.error(`Player error: ${error.message}`);
    interaction.reply("There was an error playing the music.");
    connection.destroy();
  });
}
