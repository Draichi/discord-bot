import { Client, GatewayIntentBits } from "discord.js";
import * as dotenv from "dotenv";

dotenv.config();

export default async function handler(_, response) {
  const client = new Client({ intents: [GatewayIntentBits.Guilds] });

  await client.login(process.env.DISCORD_BOT_TOKEN);

  client.once("ready", async (c) => {
    const guild = c.guilds.cache.get("1091486972616376441");
    const channel = guild.channels.cache.get("1102648245106257990");

    const discordResponse = await channel.send("Quais serão os sites de hoje?");

    return response.send({
      ...discordResponse,
    });
  });
}
