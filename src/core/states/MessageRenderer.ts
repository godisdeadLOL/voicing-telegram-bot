import { ChatContextManager } from "@/core/ChatContextManager"
import { InlineKeyboardButton } from "node-telegram-bot-api"

type MessageRendererData = {
	messageId?: number

	previousText?: string
	previousKeyboard?: string
}

export abstract class MessageRenderer<T = any> {
	async render(context: ChatContextManager, interactable: boolean) {
		const { chatId, stateId, bot } = context.data

		const text = this.buildText(context, interactable)
		const keyboard = this.buildKeyboard(context, interactable)

		const saveData = context.getSaveData<MessageRendererData>(stateId)
		if (!saveData.messageId) {
			const text = this.buildText(context, interactable)
			const keyboard = this.buildKeyboard(context, interactable)

			const message = await bot.sendMessage(chatId, text, { reply_markup: { inline_keyboard: keyboard }, parse_mode: "Markdown" as const })

			saveData.messageId = message.message_id
		} else {
			const messageOptions = { chat_id: chatId, message_id: saveData.messageId, parse_mode: "Markdown" as const }

			if (JSON.stringify(keyboard) !== saveData.previousKeyboard) {
				await bot.editMessageReplyMarkup({ inline_keyboard: keyboard }, messageOptions)
				context.data.flags["answeredCallbackQuery"] = true
			}

			if (text !== saveData.previousText) await bot.editMessageText(text, messageOptions)
		}

		saveData.previousText = text
		saveData.previousKeyboard = JSON.stringify(keyboard)
	}

	clear(context: ChatContextManager) {
		const saveData = context.getSaveData<MessageRendererData>(context.data.stateId)
		saveData.messageId = undefined
		saveData.previousKeyboard = undefined
		saveData.previousText = undefined
	}

	protected buildText(context: ChatContextManager, interactable: boolean): string {
		return ""
	}

	protected buildKeyboard(context: ChatContextManager, interactable: boolean): InlineKeyboardButton[][] {
		return []
	}

	protected getSaveData(context: ChatContextManager): T {
		return context.getSaveData<T>(context.data.stateId)
	}
}
