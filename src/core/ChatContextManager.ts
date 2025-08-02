import { EventManager } from "@/core/events"
import { ChatState } from "@/core/states"
import TelegramBot from "node-telegram-bot-api"

type ChatContextData = {
	bot: TelegramBot
	chatId: number

	stateId: string
	prevStateId?: string

	states: { id: string; state: ChatState }[]
	savesData: Record<string, any>

	eventManager: EventManager

	flags: Record<string, any>
}

export class ChatContextManager {
	constructor(public data: ChatContextData) {}

	getStateIndex() {
		const index = this.data.states.findIndex((entry) => entry.id === this.data.stateId)
		return index
	}

	getNextStateId() {
		return this.getStateIdByIndex(this.getStateIndex() + 1)
	}

	getStateIdByIndex(index: number) {
		return this.data.states[index].id
	}

	getSaveData<T>(stateId: string): T {
		let saveData = this.data.savesData[stateId]
		if (!saveData) {
			const state = this.data.states.find((state) => state.id === stateId)?.state
			if (!state) throw new Error("Unknown state error")

			saveData = state.generateSaveData()
			this.data.savesData[stateId] = saveData
		}
		return saveData as T
	}

	resetSavesData() {
		Object.keys(this.data.savesData).forEach((key) => delete this.data.savesData[key])
	}

	sendEmptyEvent() {
		this.data.eventManager.pushEvent(this.data.chatId, { type: "empty", data: { chatId: this.data.chatId } })
	}
}
