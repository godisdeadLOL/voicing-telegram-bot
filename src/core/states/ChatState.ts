import { ChatContextManager } from "@/core/ChatContextManager"
import { MessageRenderer } from "./MessageRenderer"

export abstract class ChatState<T = any> {
	renderer: MessageRenderer | null = null

	generateSaveData(): T | object {
		return {}
	}

	async enter(context: ChatContextManager): Promise<void> {}

	async send(context: ChatContextManager): Promise<void> {
		if (this.renderer) await this.renderer?.render(context, true)
	}

	async exit(context: ChatContextManager): Promise<void> {
		if (this.renderer) {
			await this.renderer.render(context, false)
			this.renderer.clear(context)
		}
	}

	async stay(context: ChatContextManager): Promise<void> {
		if (this.renderer) await this.renderer.render(context, true)
	}

	protected getSaveData(context: ChatContextManager): T {
		return context.getSaveData<T>(context.data.stateId)
	}
}
