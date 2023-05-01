import { Client, Events, GatewayIntentBits } from "discord.js";
import * as dotenv from "dotenv";

dotenv.config();

export default async function handler(request, response) {
  const client = new Client({ intents: [GatewayIntentBits.Guilds] });

  const foo = client.once(Events.ClientReady, async (c) => {
    const guild = c.guilds.cache.get("1091486972616376441");
    const channel = guild.channels.cache.get("1102648245106257990");
    return await channel.send("foo bar baz");
  });
  client.login(process.env.DISCORD_BOT_TOKEN);

  return response.end({
    foo,
  });
}
