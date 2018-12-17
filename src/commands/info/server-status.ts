import { load } from "cheerio";
import { oneLine } from "common-tags";
import { RichEmbed } from "discord.js";
import { Command, CommandMessage, CommandoClient } from "discord.js-commando";
import fetch from "node-fetch";

export default class WAServerStatus extends Command {
  public constructor(client: CommandoClient) {
    super(client, {
      aliases: ["status"],
      description: "Show current WA server status",
      details: oneLine`
        Show the current status of all servers from the Worlds Adrift game.
      `,
      examples: ["server-status"],
      group: "info",
      memberName: "status",
      name: "server-status",
    });
  }

  public async run(message: CommandMessage) {
    const timeNow = Date.now();
    const [apiCall, page] = await Promise.all([
      resolveAfter(
        fetch(
          `https://www.worldsadrift.com/wp-json/servers/v1/update?_=${timeNow}`,
        ).then<JSONData>(async (r) => r.json()).catch(() => undefined),
        1000,
      ),
      resolveAfter(
        fetch(
          "https://www.worldsadrift.com/servers/",
        ).then(async (r) => r.text()).catch(() => undefined),
        1000,
      ),
    ]);
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
    if (page) {
      const $ = load(page);
      const maintenance = $(".maintenance__inner")[0];
      if (maintenance) {
        const msg = maintenance.children[3].firstChild.data!;
        embed.addField("Scheduled Maintenance", msg);
      }
    }
    return message.reply(embed);
  }
}

const ShouldBeAn = new Set(["u"]);

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

async function resolveAfter<T>(promise: Promise<T>, delay: number = 1000): Promise<T | undefined> {
  return Promise.race([promise, new Promise<undefined>((ok) => setTimeout(ok, delay).unref())]);
}
