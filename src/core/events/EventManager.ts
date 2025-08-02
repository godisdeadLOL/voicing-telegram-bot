import { EventQueue } from "./EventQueue"
import { ChatEvent } from "./types"

export class EventManager {
	public callback?: (event: ChatEvent) => Promise<void>
	public errorCallback?: (event: ChatEvent, error: Error) => Promise<void>

	private _queues: { chatId: number; queue: EventQueue<ChatEvent> }[] = []
	private _processCallback

	constructor(private interval: number = 0) {
		this._processCallback = this.processEvent.bind(this)
	}

	pushEvent(chatId: number, event: ChatEvent) {
		let queue = this._queues.find((entry) => entry.chatId === chatId)?.queue
		if (!queue) {
			const entry = {
				chatId,
				queue: new EventQueue<ChatEvent>(this._processCallback),
			}
			this._queues.push(entry)

			queue = entry.queue
		}

		queue.addEvent(event)
	}

	run() {
		this.step()
		setTimeout(() => this.run(), this.interval)
	}

	private step() {
		for (const { queue } of this._queues) {
			queue.step()
		}
	}

	private async processEvent(event: ChatEvent) {
		try {
			await this.callback?.(event)
		} catch (error) {
			await this.errorCallback?.(event, error as Error)
		}
	}
}
