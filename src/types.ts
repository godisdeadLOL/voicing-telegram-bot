import { ChatState } from "@/core/states/ChatState"
import TelegramBot from "node-telegram-bot-api"

export type ChatSession = {
	stateId: string
	prevStateId?: string

	savesData: Record<string, any>
}
