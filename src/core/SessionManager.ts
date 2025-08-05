import { ChatSession } from "@/types"
import { promises as fs } from "fs"
import * as path from "path"

const SESSIONS_FILE = "sessions.json"

export class SessionManager {
	private sessions: Map<number, string> = new Map()

	constructor(private startStateId: string = "start") {
		this.loadSessions()
	}

	private async loadSessions() {
		try {
			const data = await fs.readFile(SESSIONS_FILE, "utf-8")
			const obj = JSON.parse(data)
			this.sessions = new Map(Object.entries(obj).map(([key, value]) => [Number(key), value as string]))
		} catch {
			this.sessions = new Map()
		}
	}

	private async saveSessions() {
		const obj: Record<number, string> = {}
		for (const [key, value] of this.sessions.entries()) obj[key] = value
		await fs.writeFile(SESSIONS_FILE, JSON.stringify(obj), "utf-8")
	}

	async getSession(chatId: number): Promise<ChatSession> {
		const sessionRaw = this.sessions.get(chatId)

		let session: ChatSession | undefined = undefined
		try {
			if (sessionRaw) session = JSON.parse(sessionRaw) as ChatSession
		} catch {}

		return session ?? { stateId: this.startStateId, savesData: {} }
	}

	async hasSession(chatId: number): Promise<boolean> {
		return this.sessions.has(chatId)
	}

	async saveSession(chatId: number, session: ChatSession) {
		const sessionRaw = JSON.stringify(session)
		this.sessions.set(chatId, sessionRaw)
		await this.saveSessions()
	}
}
