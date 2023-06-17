import { Client, GatewayIntentBits, EmbedBuilder } from "discord.js";
import * as dotenv from "dotenv";
import * as cheerio from "cheerio";

dotenv.config();

function createEmbedPost(body) {
  const $ = cheerio.load(body);
  const repositoryCards = $("article.Box-row");
  const embeds = [];
  for (let i = 0; i < 3; i++) {
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

    const embedTitle = `${repositoryTitle}/${repositoryName}`;
    const randomColor = Math.floor(Math.random() * 16777215).toString(16);
    const embedPost = new EmbedBuilder()
      .setColor(+`0x${randomColor}`)
      .setTitle(embedTitle)
      .setDescription(description)
      .setURL(repositoryLink);
    embeds.push(embedPost);
  }
  return embeds;
}

export default function handler(_, response) {
  const client = new Client({ intents: [GatewayIntentBits.Guilds] });

  client.login(process.env.DISCORD_BOT_TOKEN);

  client.once("ready", async (c) => {
    const guild = c.guilds.cache.get("1091486972616376441");
    const channel = guild.channels.cache.get("1102648245106257990");

    const languages = ["typescript", "vue", "javascript"];

    for (let language of languages) {
      const githubTrendingResponse = await fetch(
        `https://github.com/trending/${language}?since=daily`
      );
      const body = await githubTrendingResponse.text();

      const embeds = createEmbedPost(body);

      await channel.send({
        content: `Top 3 trending ${language} repositories on GitHub today:`,
        embeds,
      });
    }

    response.json({ message: "OK" });
  });
}
