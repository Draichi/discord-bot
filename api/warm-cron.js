import { Client, GatewayIntentBits, EmbedBuilder } from "discord.js";
import * as dotenv from "dotenv";
import * as cheerio from "cheerio";

dotenv.config();

export default async function handler(_, response) {
  const client = new Client({ intents: [GatewayIntentBits.Guilds] });

  const githubTypescriptTrendingPage = await fetch(
    "https://github.com/trending/typescript?since=daily"
  );

  const body = await githubTypescriptTrendingPage.text();

  const $ = cheerio.load(body);

  const repositoryCards = $("article.Box-row");
  const res = [];
  for (let i = 0; i < 5; i++) {
    const repositoryCard = $(repositoryCards.get(i));
    const repositoryCreator = repositoryCard.find("h2.h3 > a").text().trim();
    const description =
      repositoryCard.find("p").text().trim() || "No description provided.";
    const repositoryLink = `https://github.com${repositoryCard
      .find("h2.h3 > a")
      .attr("href")}`;
    const repositoryNameAndTitle = repositoryCreator.split("/");
    const repositoryTitle = repositoryNameAndTitle[0].trim();
    const repositoryName = repositoryNameAndTitle[1].trim();
    res.push({
      repositoryName,
      repositoryTitle,
      description,
      repositoryLink,
    });
  }

  client.login(process.env.DISCORD_BOT_TOKEN);

  client.once("ready", async (c) => {
    const guild = c.guilds.cache.get("1091486972616376441");
    const channel = guild.channels.cache.get("1102648245106257990");

    const embeds = [];

    res.forEach((item) => {
      const { description, repositoryName, repositoryTitle, repositoryLink } =
        item;
      const randomColor = Math.floor(Math.random() * 16777215).toString(16);

      const embedTitle = `${repositoryTitle}/${repositoryName}`;

      const embededPost = new EmbedBuilder()
        .setColor(+`0x${randomColor}`)
        .setTitle(embedTitle)
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
