import { ChatContextManager } from "@/core/ChatContextManager"
import { ChatState, IEmptyHandler } from "@/core/states"

export class MessageState extends ChatState implements IEmptyHandler {
	constructor(public message: string, public nextStateId?: string) {
		super()
	}

	async send(context: ChatContextManager): Promise<void> {
		const { bot, chatId } = context.data

		await bot.sendMessage(chatId, this.message, { parse_mode: "Markdown" })

		await new Promise((resolve) => setTimeout(resolve, 1000))
		context.sendEmptyEvent()
	}

	async handleEmpty(context: ChatContextManager): Promise<string | undefined> {
		return this.nextStateId ?? context.getNextStateId()
	}
}
