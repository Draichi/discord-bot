import { Client, GatewayIntentBits, EmbedBuilder } from "discord.js";
import { JSDOM } from "jsdom";
import * as dotenv from "dotenv";

dotenv.config();

export default async function handler(_, response) {
  const client = new Client({ intents: [GatewayIntentBits.Guilds] });

  const githubTypescriptTrendingPage = await fetch(
    "https://github.com/trending/typescript?since=daily"
  );

  const r = await githubTypescriptTrendingPage.text();

  const dom = new JSDOM(r);
  const repositoryCards =
    dom.window.document.querySelectorAll("article.Box-row");

  const res = [];
  for (let i = 0; i < 5; i++) {
    const repositoryCard = repositoryCards.item(i);
    const repositoryCreator = repositoryCard.querySelector("h2.h3 > a");
    const description = repositoryCard.querySelector("p").textContent.trim();
    const repositoryLink = `https://github.com${repositoryCreator.getAttribute(
      "href"
    )}`;
    const repositoryTitle = repositoryCreator
      .querySelector("span")
      .textContent.split("/")[0]
      .trim();
    const repositoryName = repositoryCreator.textContent.split("/")[1].trim();

    res.push({
      repositoryLink,
      repositoryTitle,
      description,
      repositoryName,
    });
  }

  client.login(process.env.DISCORD_BOT_TOKEN);

  client.once("ready", async (c) => {
    const guild = c.guilds.cache.get("1091486972616376441");
    const channel = guild.channels.cache.get("1102648245106257990");

    const embeds = [];

    res.forEach((item) => {
      const { description, repositoryTitle, repositoryLink, repositoryName } =
        item;
      const randomColor = Math.floor(Math.random() * 16777215).toString(16);

      const embededPost = new EmbedBuilder()
        .setColor(+`0x${randomColor}`)
        .setTitle(repositoryTitle)
        .setDescription(description)
        .setURL(repositoryLink);

      embeds.push(embededPost);
    });

    const discordResponse = await channel.send({
      content: "Top 5 trending TypeScript repositories on GitHub today:",
      embeds,
    });

    return response.send(discordResponse);
  });
}
