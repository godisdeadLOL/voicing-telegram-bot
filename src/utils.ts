import archiver from "archiver"
import { exec } from "child_process"
import ffmpeg from "ffmpeg"
import fs from "fs"
import TelegramBot, { Message } from "node-telegram-bot-api"

export async function archiveFolderContent(folderPath: string, outputPath: string) {
	const archive = archiver("zip", { zlib: { level: 9 } })
	const stream = fs.createWriteStream(outputPath)

	return new Promise<void>((resolve, reject) => {
		archive
			.directory(folderPath, false)
			.on("error", (err) => reject(err))
			.pipe(stream)

		stream.on("close", () => resolve())
		archive.finalize()
	})
}

export function convertAudio(inputPath: string, outputPath: string) {
	return new Promise((resolve, reject) => {
		const command = `ffmpeg -y -i "${inputPath}" "${outputPath}`

		exec(command, (error) => {
			if (!error) resolve(outputPath)
			else reject(new Error(error.message))
		})
	})
}

export function recursiveMessageSearch<T>(msg: Message, searchFn: (msg: Message) => T | undefined) {
	const value = searchFn(msg)
	if (value) return value

	if (!msg.reply_to_message) return undefined

	return recursiveMessageSearch(msg.reply_to_message, searchFn)
}
