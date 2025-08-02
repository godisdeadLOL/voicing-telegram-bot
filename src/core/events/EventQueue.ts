export class EventQueue<T> {
    private queue: T[] = []
    private processing = false

    constructor(private callback: (event: T) => Promise<void>) { }

    addEvent(action: T) {
        this.queue.push(action)
    }

    async step() {
        if (this.processing || !this.queue.length) return

        this.processing = true

        const event = this.queue.shift()!
        await this.callback(event)

        this.processing = false
    }
}