import { ChatSession } from "@/types"

export class SessionManager {
	private sessions: Map<number, string> = new Map()

	constructor(private startStateId: string = "start") {}

	getSession(chatId: number): ChatSession {
		const sessionRaw = this.sessions.get(chatId)

		let session: ChatSession | undefined = undefined
		try {
			if (sessionRaw) session = JSON.parse(sessionRaw) as ChatSession
		} catch {}

		return session ?? { stateId: this.startStateId, savesData: {} }
	}

	hasSession(chatId: number): boolean {
		return this.sessions.has(chatId)
	}

	saveSession(chatId: number, session: ChatSession) {
		const sessionRaw = JSON.stringify(session)
		this.sessions.set(chatId, sessionRaw)
	}
}
