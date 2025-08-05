import { ChatContextManager } from "@/core/ChatContextManager"
import { SessionManager } from "@/core/SessionManager"
import { ChatState, IMessageHandler, ICallbackQueryHandler, IEmptyHandler } from "@/core/states"
import { ChatEvent } from "@/core/events/types"
import { getEventChatId } from "@/core/events/utils"
import TelegramBot from "node-telegram-bot-api"
import { EventManager } from "@/core/events"

type EventHandler = ICallbackQueryHandler | IMessageHandler
type MiddlewareStage = "before" | "between" | "after"

export type Middleware = EventHandler & { stage: MiddlewareStage }

export class ChatStateMachine {
	public middlewares: Middleware[] = []

	public sessionManager!: SessionManager
	public eventManager!: EventManager

	constructor(private bot: TelegramBot, private states: { id: string; state: ChatState }[]) {}

	async processEvent(event: ChatEvent) {
		const chatId = getEventChatId(event)

		console.log(`[ChatStateMachine] Processing event ${event.type} in ${chatId}`)

		const { session, isFirstMessage } = await this.loadSession(chatId)
		const currentState = this.getState(session.stateId)

		// Создание контекста
		const context = new ChatContextManager({
			bot: this.bot,
			eventManager: this.eventManager,
			states: this.states,
			chatId,
			stateId: session.stateId,
			prevStateId: session.prevStateId,
			savesData: session.savesData,
			flags: {},
		})

		// Отправка первого сообщения
		if (isFirstMessage) {
			await currentState.enter(context)
			await currentState.send(context)

			await this.sessionManager.saveSession(chatId, session)
			return
		}

		// Обработка ивента от пользователя
		const nextStateId = (await this.handleMiddleware(event, "before", context)) ?? (await this.handleEvent(event, currentState, context))

		if (!nextStateId) {
			// Состояние не изменилось
			await currentState.stay(context)
		} else {
			// Переход в новое состояние
			const nextState = this.getState(nextStateId)

			await currentState.exit(context)

			await this.handleMiddleware(event, "between", context)

			context.data.stateId = nextStateId
			context.data.prevStateId = session.stateId

			await nextState.enter(context)
			await nextState.send(context)

			session.prevStateId = session.stateId
			session.stateId = nextStateId
		}

		await this.handleMiddleware(event, "after", context)
		await this.sessionManager.saveSession(chatId, session)
	}

	private async loadSession(chatId: number) {
		return {
			isFirstMessage: !(await this.sessionManager.hasSession(chatId)),
			session: await this.sessionManager.getSession(chatId),
		}
	}

	private getState(stateId: string) {
		const state: ChatState | undefined = this.states.find((state) => state.id === stateId)?.state
		if (!state) throw new Error(`Unknown state id: ${stateId}`)

		return state
	}

	private async handleMiddleware(event: ChatEvent, stage: MiddlewareStage, context: ChatContextManager) {
		for (const handler of this.middlewares.filter((entry) => entry.stage === stage)) {
			const nextStateId = await this.handleEvent(event, handler, context)
			if (nextStateId) return nextStateId
		}
	}

	private async handleEvent(event: ChatEvent, handler: ChatState | EventHandler, context: ChatContextManager) {
		if (event.type === "message" && "handleMessage" in handler) {
			return await (handler as IMessageHandler).handleMessage(context, event.data)
		} else if (event.type === "callbackQuery" && "handleQueryCallback" in handler) {
			return await (handler as ICallbackQueryHandler).handleQueryCallback(context, event.data)
		} else if (event.type === "empty" && "handleEmpty" in handler) {
			return await (handler as IEmptyHandler).handleEmpty(context)
		}
	}
}
