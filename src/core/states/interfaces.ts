import { ChatContextManager } from "@/core/ChatContextManager"
import TelegramBot from "node-telegram-bot-api"

export interface ICallbackQueryHandler {
	handleQueryCallback(context: ChatContextManager, callback: TelegramBot.CallbackQuery): Promise<string | undefined>
}

export interface IMessageHandler {
	handleMessage(context: ChatContextManager, msg: TelegramBot.Message): Promise<string | undefined>
}

export interface IEmptyHandler {
	handleEmpty(context: ChatContextManager): Promise<string | undefined>
}
