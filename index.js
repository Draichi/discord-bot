import { createApp, eventHandler, createRouter } from "h3";
import { Client, Events, GatewayIntentBits } from "discord.js";
import * as dotenv from "dotenv";

dotenv.config();

const app = createApp();
const router = createRouter()
  .get(
    "/",
    eventHandler(() => "Hello World!")
  )
  .get(
    "/api/cron",
    eventHandler(() => {
      const client = new Client({ intents: [GatewayIntentBits.Guilds] });

      let response = { foo: "bar" };

      client.once(Events.ClientReady, async (c) => {
        const guild = c.guilds.cache.get("1091486972616376441");
        const channel = guild.channels.cache.get("1102648245106257990");
        response = await channel.send("foo bar");
      });

      client.login(process.env.DISCORD_BOT_TOKEN);
      return {
        response,
      };
    })
  );
app.use(router);

module.exports = app;
