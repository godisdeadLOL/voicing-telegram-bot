import TelegramBot from "node-telegram-bot-api"

type EventTypeMap = {
	message: TelegramBot.Message
	callbackQuery: TelegramBot.CallbackQuery
	empty: { chatId: number }
}

export type ChatEvent = {
	[K in keyof EventTypeMap]: { type: K; data: EventTypeMap[K] }
}[keyof EventTypeMap]
