import { CommandoClient, SQLiteProvider } from "discord.js-commando";
import { join } from "path";
import { open } from "sqlite";
import { token } from "./auth";

main().catch(errorHandler);

async function main() {
  const client = new CommandoClient();
  client.on("error", (e) => console.error(e));
  client.on("warn", (i) => console.warn(i));
  client.on("ready", async () => {
    console.log(`Client ready; logged in as ${client.user.username}#${client.user.discriminator} (${client.user.id})`);
    switch (process.env.NODE_ENV) {
      case "development":
        await client.user.setPresence({
          game: {
            name: "DevOps IV: Life",
            type: "PLAYING",
          },
          status: "idle",
        });
        break;
      default:
        await client.user.setPresence({
          status: "online",
        });
    }
  });

  client.registry
    .registerGroups([
      ["info", "Information"],
      ["party", "Party management"],
    ])
    .registerDefaults()
    // .registerTypesIn(join(__dirname, "types"))
    .registerCommandsIn(join(__dirname, "commands"));

  await Promise.all([
    client.setProvider(open(`${__dirname}/db.sqlite3`).then(((db) => new SQLiteProvider(db)))),
    client.login(token),
  ]);
}

function errorHandler(error: any) {
  console.error(error);
  process.exit(1);
}
