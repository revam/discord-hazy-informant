import { load } from "cheerio";
import { Client, RichEmbed } from "discord.js";
import fetch from "node-fetch";

const ShouldBeAn = new Set(["u"]);

main().catch(errorHandler);

async function main() {
  const client = new Client();
  client.on("error", errorHandler);
  client.on("ready", () => {
    console.log(`Client for ${client.user.username} is ready.`);
  });

  // Create an event listener for messages
  client.on("message", async({channel, content}) => {
    if (content[0] !== "!" || content.length < 2) {
      return;
    }
    const content_array = content.substring(1).split(/\s+/g);
    const command = content_array.shift();
    // If the message is "ping"
    if (command === "ping") {
      await channel.send("pong");
    }
    else if (command === "status") {
      const timeNow = Date.now();
      const [apiCall/*, page */] = await rejectAfter(
        Promise.all([
          resolveAfter(
            fetch(
              `https://www.worldsadrift.com/wp-json/servers/v1/update?_=${timeNow}`,
            ).then<JSONData>(async (r) => r.json()).catch(() => undefined),
            1000,
          ),
          // resolveAfter(
          //   fetch(
          //     "https://www.worldsadrift.com/servers/",
          //   ).then((r) => r.text()).catch(() => undefined),
          //   1000,
          // ),
        ]),
        1500,
      );
      const embed = new RichEmbed({
        color: 0x3498DB,
        description: "Current status of each server:",
        timestamp: new Date(timeNow),
        title: "Server Status",
        url: "https://www.worldsadrift.com/servers/",
      });
      if (apiCall && apiCall.success) {
        for (const info of loadServerInfo(apiCall.data)) {
          const a = ShouldBeAn.has(info.population[0]) ? "an" : "a";
          embed.addField(info.name, `Is **${info.status}**, with ${a} **${info.population}** population.`);
        }
      }
      // if (page) {
      //   const $ = load(page);
      //   const maintenance = $(".maintenance__inner")[0];
      //   if (maintenance) {
      //     const message = maintenance.children[3].firstChild.data!;
      //     embed.addField("Scheduled Maintenance", message);
      //   }
      // }
      await channel.send(embed);
    }
    console.log("Sent replay.");
  });

  await client.login(process.env.DISCORD_TOKEN);
}

async function resolveAfter<T>(promise: Promise<T>, delay: number = 1000): Promise<T | undefined> {
  return Promise.race([promise, new Promise<undefined>((ok) => setTimeout(ok, delay).unref())]);
}

async function rejectAfter<T>(promise: Promise<T>, delay: number = 1000): Promise<T | never> {
  return Promise.race([promise, new Promise<never>((_, nok) => setTimeout(nok, delay).unref())]);
}

function errorHandler(error: any) {
  console.error(error);
  process.exit(1);
}

function loadServerInfo(html: string): ServerInfo[] {
  const $ = load(html);
  const infos: ServerInfo[] = [];
  $(".servers__server").each((_, e) => {
    const status = e.firstChild.firstChild.children[3].firstChild.data as ServerInfo["status"];
    let population = e.firstChild.lastChild.lastChild.firstChild.data;
    if (population === "N/A" || !population) {
      population = "unknown";
    }
    const info: ServerInfo = {
      isOnline: status === "Online",
      name: e.firstChild.firstChild.children[2].firstChild.data!,
      population,
      status,
    };
    infos.push(info);
  });
  return infos;
}

interface JSONData {
  success: boolean;
  data: string;
}

interface ServerInfo {
  name: string;
  status: "Online" | "Offline";
  isOnline: boolean;
  population: string;
}
