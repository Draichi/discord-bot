import { Client, GatewayIntentBits, EmbedBuilder } from "discord.js";
import { JSDOM } from "jsdom";
import * as dotenv from "dotenv";

dotenv.config();

export default async function handler(_, response) {
  const client = new Client({ intents: [GatewayIntentBits.Guilds] });

  const awwwardsResponse = await fetch(
    "https://www.awwwards.com/websites/sites_of_the_day/"
  );

  const r = await awwwardsResponse.text();

  const dom = new JSDOM(r);
  const cards = dom.window.document.querySelectorAll("li.js-collectable");

  const res = [];

  for (let i = 0; i < 3; i++) {
    const card = cards.item(i);
    const websiteURL = card
      .querySelector(".figure-rollover__bt")
      .getAttribute("href");
    const websiteTitle = card
      .querySelectorAll(".figure-rollover__row")
      .item(1).textContent;
    const websiteImage = card
      .querySelector(".figure-rollover__file")
      .getAttribute("data-srcset")
      .split(" ")[0];
    const websiteCompany = card.querySelector(
      "figcaption.avatar-name__name"
    ).textContent;
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
      content: "Quais serão os sites de hoje?",
      embeds,
    });

    return response.send({
      ...discordResponse,
    });
  });
}
