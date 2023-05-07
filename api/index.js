import express from "express";
import { Client, GatewayIntentBits, EmbedBuilder } from "discord.js";
import { JSDOM } from "jsdom";
import * as dotenv from "dotenv";

const cron = require("cron");

dotenv.config();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.login(process.env.DISCORD_BOT_TOKEN);

const app = express();

client.once("ready", async (c) => {
  console.log(`Online as ${c?.user?.tag}`);

  new cron.CronJob("*/10 * * * *", async () => {
    const awwwardsResponse = await fetch(
      "https://www.awwwards.com/websites/sites_of_the_day/"
    );

    const r = await awwwardsResponse.text();

    const dom = new JSDOM(r);
    const cardSite = dom.window.document.querySelector(".card-site");
    const websiteURL = cardSite.querySelector(".figure-rollover__bt").href;
    const websiteTitle = cardSite
      .querySelectorAll(".figure-rollover__row")
      .item(1).textContent;
    const websiteImage = cardSite
      .querySelector(".figure-rollover__file")
      .getAttribute("data-srcset")
      .split(" ")[0];

    const guild = c.guilds.cache.get("1091486972616376441");
    const channel = guild.channels.cache.get("1102648245106257990");

    const exampleEmbed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle("Site of the day")
      .setThumbnail(websiteImage)
      .addFields(
        { name: "Website URL", value: websiteURL },
        { name: "Webstie Title", value: websiteTitle },
        { name: "Website title", value: "Some value here", inline: true },
        { name: "Inline field title", value: "Some value here", inline: true }
      )
      .setImage(websiteImage)
      .setTimestamp();

    const discordResponse = await channel.send({
      embeds: [exampleEmbed],
    });

    console.log(discordResponse);
  });
});

app.get("/api", (req, res) => {
  res.setHeader("Content-Type", "application/json");

  res.setHeader("Cache-Control", "s-max-age=1, stale-while-revalidate");

  res.json({ client });
});

module.exports = app;
