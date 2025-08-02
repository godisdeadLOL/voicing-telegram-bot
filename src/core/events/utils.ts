import { ChatEvent } from "./types"

export function getEventChatId(event: ChatEvent): number {
	switch (event.type) {
		case "empty":
			return event.data.chatId
		case "callbackQuery":
			return event.data.message?.chat.id!
		case "message":
			return event.data.chat.id
	}
}
