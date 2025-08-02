import { Middleware } from "@/core/ChatStateMachine"

export const middlewaresBefore: Middleware[] = [
	{
		stage: "before",
		async handleMessage(context, msg) {
			console.log("[ResetMiddleware]", "Current state:", context.data.stateId)

			if (["reset_confirm", "result_download"].indexOf(context.data.stateId) !== -1) return
			else if (msg.text?.trim() === "/reset") return "reset_confirm"

			return
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
