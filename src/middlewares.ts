import { Middleware } from "@/core/ChatStateMachine"

export const middlewaresBefore: Middleware[] = [
	{
		stage: "before",
		async handleMessage(context, msg) {
			if (msg.text?.trim() !== "/reset") return
			if (context.data.stateId === "result_download") return
			
			if (context.data.stateId === "reset_confirm") {
				context.data.flags["toReset"] = true
				return "scenario_upload"
			}

			return "reset_confirm"
		},
	},
]

export const middlewaresBetween: Middleware[] = [
	{
		stage: "between",
		async handleQueryCallback(context, msg) {
			if (context.data.flags["toReset"]) {
				context.data.flags["toReset"] = undefined
				context.resetSavesData()
			}
			return undefined
		},
	},
]

export const middlewaresAfter: Middleware[] = [
	{
		stage: "after",
		async handleQueryCallback(context, callback) {
			if (!context.data.flags["answeredCallbackQuery"]) {
				context.data.bot.answerCallbackQuery(callback.id)
			}
			return undefined
		},
	},
]
