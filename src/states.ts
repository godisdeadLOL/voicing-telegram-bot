import { ScenarioUploadState } from "@/states/ScenarioUploadState"
import { ConfirmState } from "@/states/ConfirmState"
import { CharacterSelectState } from "@/states/CharacterSelectState"
import { ClipRecordState } from "@/states/ClipRecordState"
import { ResultDownloadState } from "@/states/ResultDownloadState"
import { MessageState } from "@/states/MessageState"

import fs from "fs"

const introText = fs.readFileSync("data/intro.md", { encoding: "utf-8" })

export const states = [
	{
		id: "start",
		state: new ConfirmState(introText, [{ text: "Начать", result: "scenario_upload" }]),
	},

	{ id: "scenario_upload", state: new ScenarioUploadState() },
	{ id: "character_select", state: new CharacterSelectState() },
	{ id: "clip_record", state: new ClipRecordState() },

	{
		id: "download_confirm",
		state: new ConfirmState("Начать подготовку архива?", [
			{ text: "Подтвердить", result: "result_download" },
			{ text: "Отмена", result: "clip_record" },
		]),
	},

	{ id: "result_download", state: new ResultDownloadState() },

	{
		id: "reset_confirm",
		state: new ConfirmState("Начать заново?", [
			{
				text: "Подтвердить",
				result: async (context) => {
					context.data.flags["toReset"] = true
					return "scenario_upload"
				},
			},
			{
				text: "Отмена",
				result: async (context) => {
					const prevState = context.data.prevStateId
					return prevState === "result_download" ? "clip_record" : prevState
				},
			},
		]),
	},
]
