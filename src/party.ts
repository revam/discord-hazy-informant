// import { randomBytes } from "crypto";
// import { Guild, Channel, Message, TextChannel, VoiceChannel, User, Client, PermissionString, CategoryChannel, Role } from "discord.js";

// const TAG_REGEX = /^Party ([\dA-F]{6})$/;

// class Party {
//   public readonly guild: Guild;
//   public readonly channels: [VoiceChannel, TextChannel, ...TextChannel[]];
//   public readonly role: Role;

//   public get category(): CategoryChannel {
//     return this.guild.channels.find((c) => c instanceof CategoryChannel && Boolean(c.rolePermissions(this.role))) as CategoryChannel;
//   }

//   public get name(): string {
//     return this.category.name;
//   }

//   public get tag(): string {
//     return TAG_REGEX.exec(this.role.name)![1];
//   }

//   public get totalMembers(): number {
//     return this.channels[0].userLimit;
//   }

//   public static async create(guild: Guild, members: [User, ...User[]], name?: string, public: boolean = false): Promise<Party> {
//     if (guild.roles.some((r) => r.name.startsWith("Party"))) {

//     }
//     const permissions: PermissionString[] = [];
//     const partyTag = randomTag();
//     const memberRole = await guild.createRole({
//       color: 0xFFFF00,
//       mentionable: public,
//       name: `Party ${partyTag}`,
//     });
//     memberRole.members.set
//   }

//   public static from(channel: Channel | Message): Party {
//   }
// }

// function randomTag(): string {
//   return randomBytes(3).toString("hex").toUpperCase();
// }
