import { Client, GatewayIntentBits, EmbedBuilder } from "discord.js";
import * as dotenv from "dotenv";
import * as cheerio from "cheerio";

dotenv.config();

export default async function handler(_, response) {
  const client = new Client({ intents: [GatewayIntentBits.Guilds] });

  const awwwardsResponse = await fetch(
    "https://www.awwwards.com/websites/sites_of_the_day/"
  );

  const body = await awwwardsResponse.text();

  const $ = cheerio.load(body);
  const cards = $("li.js-collectable");

  const res = [];

  for (let i = 0; i < 3; i++) {
    const card = $(cards.get(i));

    const websiteURL = card.find(".figure-rollover__bt").attr("href");
    const websiteTitle = $(card.find(".figure-rollover__row").get(1)).text();
    const websiteImage = card
      .find(".figure-rollover__file")
      .attr("data-srcset")
      .split(" ")[0];
    const websiteCompany = card
      .find("figcaption.avatar-name__name")
      .text()
      .trim();
    res.push({ websiteImage, websiteTitle, websiteURL, websiteCompany });
  }

  client.login(process.env.DISCORD_BOT_TOKEN);

  client.once("ready", async (c) => {
    const guild = c.guilds.cache.get("1091486972616376441");
    const channel = guild.channels.cache.get("1102648245106257990");

    const embeds = [];

    res.forEach((item) => {
      const { websiteImage, websiteTitle, websiteURL, websiteCompany } = item;
      const randomColor = Math.floor(Math.random() * 16777215).toString(16);

      const embededPost = new EmbedBuilder()
        .setColor(+`0x${randomColor}`)
        .setTitle(websiteTitle)
        .setDescription(websiteCompany)
        .setURL(websiteURL)
        .setThumbnail(websiteImage);

      embeds.push(embededPost);
    });

    const discordResponse = await channel.send({
      content: "Sites of the day from Awwwards:",
      embeds,
    });

    return response.send({
      ...discordResponse,
    });
  });
}
