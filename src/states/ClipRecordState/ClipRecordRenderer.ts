import { ChatContextManager } from "@/core/ChatContextManager"
import { MessageRenderer } from "@/core/states/MessageRenderer"
import { ClipRecordData } from "./types"
import { InlineKeyboardButton } from "node-telegram-bot-api"

export class ClipRecordRenderer extends MessageRenderer<ClipRecordData> {
	protected buildText(context: ChatContextManager, interactable: boolean): string {
		const saveData = this.getSaveData(context)
		const { scenario, index, voiced } = saveData

		const isVoiced = voiced[index]

		return `*Озвучьте реплику*:${isVoiced ? " _(озвучено)_" : ""}\n\n_${scenario[index].name}_: ${scenario[index].content}`
	}

	protected buildKeyboard(context: ChatContextManager, interactable: boolean): InlineKeyboardButton[][] {
		if (!interactable) return []

		const saveData = this.getSaveData(context)
		const scenario = saveData.scenario

		const currentIndex = saveData.index

		const longPrevIndex = Math.max(0, saveData.index - 5)
		const prevIndex = Math.max(0, saveData.index - 1)

		const nextIndex = Math.min(saveData.index + 1, scenario.length - 1)
		const longNextIndex = Math.min(saveData.index + 5, scenario.length - 1)

		const completed = saveData.voiced.indexOf(false) === -1

		return [
			[
				{ text: `⬅️ В начало`, callback_data: "start" },
				{ text: `В конец ➡️`, callback_data: "end" },
				{ text: completed ? "💾 Скачать" : "↪️ Продолжить", callback_data: completed ? "download" : "continue" },
			],
			[
				{ text: `⏪ ${longPrevIndex + 1}`, callback_data: "long_prev" },
				{ text: `⬅️ ${prevIndex + 1}`, callback_data: "prev" },
				{ text: `${currentIndex + 1} / ${scenario.length}`, callback_data: "null" },
				{ text: `${nextIndex + 1} ➡️`, callback_data: "next" },
				{ text: `${longNextIndex + 1} ⏩`, callback_data: "long_next" },
			],
		]
	}
}
