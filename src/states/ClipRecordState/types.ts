import { ScenarioEntry } from "@/states/ScenarioUploadState"

export type ClipRecordData = {
	index: number
	nextIndex: number | null

	scenario: ScenarioEntry[]
	voiced: boolean[]

	error: string | null
}
