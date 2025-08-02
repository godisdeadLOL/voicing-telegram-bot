import { ChatContextManager } from "@/core/ChatContextManager"
import { InlineKeyboardButton } from "node-telegram-bot-api"
import { Action, ConfirmStateData } from "./types"
import { MessageRenderer } from "@/core/states"

export class ConfirmRenderer extends MessageRenderer<ConfirmStateData> {
	constructor(public message: string, public actions: Action[]) {
		super()
	}

	protected buildKeyboard(context: ChatContextManager, interactable: boolean): InlineKeyboardButton[][] {
		const saveData = this.getSaveData(context)

		const buttons: InlineKeyboardButton[] = []
		for (let i = 0; i < this.actions.length; i++) {
			const isSelected = saveData.selected === i

			buttons.push({
				text: `${isSelected ? "🟢 " : ""}${this.actions[i].text}`,
				callback_data: interactable ? `select:${i}` : "null",
			})
		}

		return [[...buttons]]
	}

	protected buildText(context: ChatContextManager, interactable: boolean): string {
		return this.message
	}
}
