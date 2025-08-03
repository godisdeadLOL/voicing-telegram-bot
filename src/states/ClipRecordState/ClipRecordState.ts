import { ChatContextManager } from "@/core/ChatContextManager"
import { ICallbackQueryHandler, IMessageHandler } from "@/core/states"
import { ChatState } from "@/core/states/ChatState"
import { CharacterSelectData } from "@/states/CharacterSelectState"
import { ScenarioUploadData } from "@/states/ScenarioUploadState"
import { convertAudio, recursiveMessageSearch } from "@/utils"
import fs from "fs/promises"
import { CallbackQuery, Message } from "node-telegram-bot-api"
import { ClipRecordRenderer } from "./ClipRecordRenderer"
import { ClipRecordData } from "./types"

export class ClipRecordState extends ChatState<ClipRecordData> implements IMessageHandler, ICallbackQueryHandler {
	renderer = new ClipRecordRenderer()

	public maxVoiceDuration = 60

	generateSaveData(): ClipRecordData {
		return { index: 0, nextIndex: null, error: null } as ClipRecordData
	}

	async enter(context: ChatContextManager): Promise<void> {
		const saveData = this.getSaveData(context)

		if (saveData.nextIndex !== null) {
			saveData.index = saveData.nextIndex
			saveData.nextIndex = null
		}

		if (saveData.scenario) return

		const scenario = context.getSaveData<ScenarioUploadData>("scenario_upload")?.scenario
		if (!scenario) throw new Error("Scenario data is null")

		const characters = context.getSaveData<CharacterSelectData>("character_select")?.characters
		if (!characters) throw new Error("Character selection data is null")

		// Сгенерировать сценарий содержащий выбранных персонажей
		saveData.scenario = scenario.filter((entry) => characters.some((character) => character.id === entry.id && character.selected))

		saveData.voiced = Array(saveData.scenario.length).fill(false)
	}

	async exit(context: ChatContextManager): Promise<void> {
		await super.exit(context)

		await this.logError(context)
		this.getSaveData(context).error = null
	}

	async handleQueryCallback(context: ChatContextManager, callback: CallbackQuery): Promise<string | undefined> {
		const saveData = this.getSaveData(context)
		const scenario = saveData.scenario

		switch (callback.data) {
			case "long_prev":
				saveData.index = Math.max(saveData.index - 5, 0)

			case "prev":
				saveData.index = Math.max(saveData.index - 1, 0)
				break

			case "next":
				saveData.index = Math.min(saveData.index + 1, scenario.length - 1)
				break

			case "long_next":
				saveData.index = Math.min(saveData.index + 5, scenario.length - 1)
				break

			case "start":
				saveData.index = 0
				break

			case "end":
				saveData.index = scenario.length - 1
				break

			case "download":
				return context.getNextStateId()

			case "continue":
				const nextIndex = this.getNextIndex(context)
				if (nextIndex !== -1) saveData.index = nextIndex
		}

		return
	}

	async handleMessage(context: ChatContextManager, msg: Message): Promise<string | undefined> {
		const { chatId, bot, stateId } = context.data
		const saveData = this.getSaveData(context)

		// Валидация аудио
		const voice = recursiveMessageSearch(msg, (msg) => msg.voice)
		if (!voice) {
			saveData.error = "В сообщении нет аудио"
			return stateId
		}

		if (voice.duration > this.maxVoiceDuration) {
			saveData.error = "Максимальная длительность аудио превышена"
			return stateId
		}

		// Сохранение и конверсия аудио
		const scenarioEntry = saveData.scenario[saveData.index]

		const downloadPath = await bot.downloadFile(voice.file_id, `downloads/${chatId}`)
		const audioPath = `downloads/${chatId}/clips/${scenarioEntry.index}-${scenarioEntry.id}.wav`

		await convertAudio(downloadPath, audioPath)
		await fs.rm(downloadPath)

		// Переход к следующей реплике или к следующему состоянию
		saveData.voiced[saveData.index] = true
		saveData.error = null

		const nextIndex = this.getNextIndex(context)
		if (nextIndex === -1) {
			return context.getNextStateId()
		}

		saveData.nextIndex = nextIndex
		return stateId
	}

	/**
	 * Возвращает индекс следующей неозвученной реплики
	 */
	private getNextIndex(context: ChatContextManager) {
		const { voiced, index: curIndex } = this.getSaveData(context)

		if (!voiced[curIndex]) return curIndex

		const amount = voiced.filter((value) => !value).length
		if (amount < 1) return -1

		let nextIndex = voiced.findIndex((value, index) => !value && index > curIndex)
		if (nextIndex === -1) nextIndex = voiced.findIndex((value) => !value)

		return nextIndex
	}

	private async logError(context: ChatContextManager) {
		const { bot, chatId } = context.data

		const { error } = this.getSaveData(context)
		if (!error) return

		await bot.sendMessage(chatId, `⚠️ Ошибка при загрузке аудио: _${error}_.\nПожалуйста, попробуйте еще раз.`, { parse_mode: "Markdown" })
	}
}
