import { ChatContextManager } from "@/core/ChatContextManager"
import { IEmptyHandler } from "@/core/states"
import { ChatState } from "@/core/states/ChatState"
import { archiveFolderContent } from "@/utils"
import fs from "fs/promises"

type ResultDownloadData = {
	error: boolean
}

export class ResultDownloadState extends ChatState<ResultDownloadData> implements IEmptyHandler {
	generateSaveData() {
		return { error: false }
	}

	async send(context: ChatContextManager): Promise<void> {
		const { chatId, bot } = context.data

		try {
			const message = await bot.sendMessage(chatId, "⌛ Подготовка архива...")

			const archivePath = `downloads/${chatId}/audio.zip`
			await archiveFolderContent(`downloads/${chatId}/clips`, archivePath)

			await bot.deleteMessage(chatId, message.message_id)
			await bot.sendDocument(chatId, archivePath)

			// fs.rm(archivePath)
		} catch {
			this.getSaveData(context).error = true
		} finally {
			context.sendEmptyEvent()
		}
	}

	async handleEmpty(context: ChatContextManager): Promise<string | undefined> {
		const { error } = this.getSaveData(context)
		if (error) return "download_confirm"
		else return context.getNextStateId()
	}
}
