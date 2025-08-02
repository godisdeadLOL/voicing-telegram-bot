import { Action, ConfirmStateData } from "./types"

import { ChatContextManager } from "@/core/ChatContextManager"
import { ICallbackQueryHandler } from "@/core/states"
import { ChatState } from "@/core/states/ChatState"
import { ConfirmRenderer } from "@/states/ConfirmState/ConfirmRenderer"
import { CallbackQuery } from "node-telegram-bot-api"

export class ConfirmState extends ChatState<ConfirmStateData> implements ICallbackQueryHandler {
	public generateSaveData() {
		return { selected: null }
	}

	constructor(public message: string, public actions: Action[]) {
		super()
		this.renderer = new ConfirmRenderer(message, actions)
	}

	async exit(context: ChatContextManager): Promise<void> {
		await super.exit(context)
		this.getSaveData(context).selected = null
	}

	async handleQueryCallback(context: ChatContextManager, callback: CallbackQuery): Promise<string | undefined> {
		const saveData = this.getSaveData(context)

		saveData.selected = parseInt(callback.data?.replace("select:", "")!)
		if (isNaN(saveData.selected)) throw new Error("Selected index is NaN")

		const action = this.actions[saveData.selected]

		if (typeof action.result === "function") return await action.result(context)
		else return action.result
	}
}
