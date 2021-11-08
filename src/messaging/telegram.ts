import { config } from "./../config";
import { Telegraf } from "telegraf";
// import {Users}  from './../models'

export class Messaging {
  private bot!: Telegraf;

  constructor() {
    this.bot = new Telegraf(config.MESSAGING.BOT_TOKEN);
    this.init();
    this.bot.launch();
  }

  init() {
    return this.bot.start((ctx: { reply: (arg0: string) => any }) =>
      ctx.reply(
        "Your account has been successfully setup to receive notifications"
      )
    );
  }

  async sendMessage(message: string) {
    [].forEach((chat: string | number) => {
      this.bot.telegram.sendMessage(chat, message, {
        parse_mode: "Markdown",
        disable_web_page_preview: true,
      });
    });
    console.log("Sent message !");
  }
}
