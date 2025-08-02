import { ChatContextManager } from "@/core/ChatContextManager"
import { CharacterSelectData } from "./types"
import { InlineKeyboardButton } from "node-telegram-bot-api"
import { MessageRenderer } from "@/core/states"

export class CharacterSelectRenderer extends MessageRenderer<CharacterSelectData> {
	protected buildKeyboard(context: ChatContextManager, interactable: boolean): InlineKeyboardButton[][] {
		const saveData = this.getSaveData(context)
		const characters = saveData.characters!

		return [
			...characters.map((character) => [
				{
					text: `${character.selected ? "☑️" : "⬜"} ${character.name}`,
					callback_data: interactable ? `select:${character.id}` : "null",
				},
			]),
			[{ text: `${saveData.confirmed ? "🟢 " : ""}Подтвердить`, callback_data: interactable ? "action:confirm" : "null" }],
		]
	}

	protected buildText(context: ChatContextManager, interactable: boolean): string {
		return "Выберите персонажей:"
	}
}
