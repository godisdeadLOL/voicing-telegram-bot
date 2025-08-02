import { ChatContextManager } from "@/core/ChatContextManager"

export type ConfirmStateData = {
	selected: number | null
}

export type Action = {
	text: string
	result: ((context: ChatContextManager) => Promise<string | undefined>) | string | undefined
}
