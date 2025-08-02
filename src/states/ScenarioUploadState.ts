import { Message } from "node-telegram-bot-api"
import { ChatContextManager } from "@/core/ChatContextManager"
import { ChatState } from "@/core/states/ChatState"
import { IMessageHandler } from "@/core/states"
import fs from "fs/promises"
import { recursiveMessageSearch } from "@/utils"

export type ScenarioEntry = {
	index: number

	id: string
	name: string
	content: string
}

export type ScenarioUploadData = {
	error: string | null
	scenario: ScenarioEntry[]
}

export class ScenarioUploadState extends ChatState<ScenarioUploadData> implements IMessageHandler {
	public maxFileSize = 2

	public generateSaveData() {
		return { isError: null }
	}

	async send(context: ChatContextManager): Promise<void> {
		const { bot, chatId } = context.data
		const { error } = this.getSaveData(context)

		const text = !error
			? `📂 Загрузите файл сценария в расширении \`.json\`. Максимальный размер: ${this.maxFileSize} МБ.`
			: `⚠️ Ошибка при загрузке файла: \`${error}\`.\nПожалуйста, попробуйте еще раз.`

		bot.sendMessage(chatId, text, { parse_mode: "Markdown" })
	}

	async handleMessage(context: ChatContextManager, msg: Message): Promise<string | undefined> {
		const { chatId, bot, stateId } = context.data

		const saveData = this.getSaveData(context)
		const document = recursiveMessageSearch(msg, (msg) => msg.document)

		if (!document) {
			saveData.error = "В сообщении нет документа"
			return stateId
		}

		const documentSize = document.file_size ? document.file_size / 1024 / 1024 : undefined
		if (documentSize! > this.maxFileSize) {
			saveData.error = "Превышен максимальный размер"
			return stateId
		}

		// При загрузке нового сценария удалить старые загрузки и создать папки под новые
		await fs.rm(`downloads/${chatId}`, { recursive: true, force: true })
		await fs.mkdir(`downloads/${chatId}/clips`, { recursive: true })

		const downloadPath = await bot.downloadFile(document.file_id, `downloads/${chatId}`)
		const content = await fs.readFile(downloadPath, { encoding: "utf-8" })

		// Парсинг сценария
		try {
			saveData.scenario = JSON.parse(content) as ScenarioEntry[]
			for (let i = 0; i < saveData.scenario.length; i++) saveData.scenario[i].index = i
		} catch {
			saveData.error = "Неверный формат сценария"
			return stateId
		}

		await fs.rm(downloadPath)
		saveData.error = null

		return context.getNextStateId()
	}
}
