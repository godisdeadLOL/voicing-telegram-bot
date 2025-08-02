import { ChatStateMachine } from "@/core/ChatStateMachine"
import { EventManager } from "@/core/events"
import { getEventChatId } from "@/core/events/utils"
import { SessionManager } from "@/core/SessionManager"
import { middlewaresAfter, middlewaresBefore, middlewaresBetween } from "@/middlewares"
import { states } from "@/states"
import TelegramBot from "node-telegram-bot-api"

if (!process.env.TELEGRAM_TOKEN) throw new Error("TELEGRAM_TOKEN is not set in the .env file")

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: { interval: 600, autoStart: false } })

const eventManager = new EventManager(100)

const stateMachine = new ChatStateMachine(bot, states)
stateMachine.sessionManager = new SessionManager(states[0].id)
stateMachine.eventManager = eventManager
stateMachine.middlewares.push(...middlewaresBefore, ...middlewaresBetween, ...middlewaresAfter)

eventManager.callback = stateMachine.processEvent.bind(stateMachine)
eventManager.errorCallback = async (event, error) => {
	const chatId = getEventChatId(event)

	console.log("Error during event:", event.type, error)

	try {
		bot.sendMessage(chatId, `*Ошибка*\n\nПри работе бота произошла критическая ошибка: \`${error.name}\``, { parse_mode: "Markdown" })
	} catch {}
}

bot.on("message", async (msg) => {
	eventManager.pushEvent(msg.chat.id, { type: "message", data: msg })
})

bot.on("callback_query", async (query) => {
	if (query.data === "null") {
		bot.answerCallbackQuery(query.id)
		return
	}

	eventManager.pushEvent(query.message!.chat.id, { type: "callbackQuery", data: query })
})

bot.startPolling()
eventManager.run()
