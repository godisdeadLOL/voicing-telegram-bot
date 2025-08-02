import { CharacterSelectData } from "./types"
import { CharacterSelectRenderer } from "./CharacterSelectRenderer"

import { ScenarioUploadData } from "@/states/ScenarioUploadState"
import { CallbackQuery } from "node-telegram-bot-api"
import { ChatContextManager } from "@/core/ChatContextManager"
import { ChatState, ICallbackQueryHandler } from "@/core/states"

export class CharacterSelectState extends ChatState<CharacterSelectData> implements ICallbackQueryHandler {
	renderer = new CharacterSelectRenderer()

	generateSaveData() {
		return { characters: null, confirmed: false }
	}

	async enter(context: ChatContextManager): Promise<void> {
		const saveData = this.getSaveData(context)
		if (saveData.characters) return

		const uploadSaveData = context.getSaveData<ScenarioUploadData>("scenario_upload")
		if (!uploadSaveData.scenario) throw new Error("Scenario data is null")

		const entries = [...new Map(uploadSaveData.scenario.map((entry) => [entry.id, entry])).values()]
		saveData.characters = entries.map((entry) => ({ id: entry.id, name: entry.name, selected: false }))
	}

	async handleQueryCallback(context: ChatContextManager, callback: CallbackQuery): Promise<string | undefined> {
		const { bot } = context.data
		const saveData = this.getSaveData(context)

		const characters = saveData.characters!

		// Подтверждение выбора
		if (callback.data === "action:confirm") {
			if (!characters.some((character) => character.selected)) {
				await bot.answerCallbackQuery(callback.id, { text: "Выберите хотя бы одного персонажа", show_alert: true })
				return
			}

			saveData.confirmed = true

			return context.getNextStateId()
		}

		// Выбор персонажей
		const id = callback.data?.replace("select:", "")

		const clicked = characters.find((charater) => charater.id === id)
		if (!clicked) return

		clicked.selected = !clicked.selected
		return
	}
}
