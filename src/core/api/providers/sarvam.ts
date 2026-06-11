import { sarvamDefaultModelId, sarvamModels, type ModelInfo } from "@shared/api"
import OpenAI from "openai"
import type { ChatCompletionTool } from "openai/resources/chat/completions"
import type { ClineStorageMessage } from "@/shared/messages/content"
import { createOpenAIClient } from "@/shared/net"
import type { ApiHandler, ApiHandlerModel, CommonApiHandlerOptions } from "../index"
import { withRetry } from "../retry"
import { convertToOpenAiMessages } from "../transform/openai-format"
import type { ApiStream } from "../transform/stream"
import { getOpenAIToolParams, ToolCallProcessor } from "../transform/tool-call-processor"

export interface SarvamHandlerOptions extends CommonApiHandlerOptions {
	sarvamApiKey?: string
	sarvamBaseUrl?: string
	sarvamModelId?: string
	sarvamModelInfo?: ModelInfo
}

export class SarvamHandler implements ApiHandler {
	private options: SarvamHandlerOptions
	private client: OpenAI | undefined

	constructor(options: SarvamHandlerOptions) {
		this.options = options
	}

	private ensureClient(): OpenAI {
		if (!this.client) {
			if (!this.options.sarvamApiKey) {
				throw new Error("Sarvam API key is required")
			}
			this.client = createOpenAIClient({
				baseURL: this.options.sarvamBaseUrl || "https://api.sarvam.ai/v1",
				apiKey: this.options.sarvamApiKey,
			})
		}
		return this.client
	}

	@withRetry()
	async *createMessage(systemPrompt: string, messages: ClineStorageMessage[], tools?: ChatCompletionTool[]): ApiStream {
		const client = this.ensureClient()
		const { id: modelId, info: modelInfo } = this.getModel()

		const openAiMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
			{ role: "system", content: systemPrompt },
			...convertToOpenAiMessages(messages),
		]

		let temperature: number | undefined
		if (modelInfo.temperature !== undefined) {
			temperature = Number(modelInfo.temperature)
		}

		let maxTokens: number | undefined
		if (modelInfo.maxTokens && modelInfo.maxTokens > 0) {
			maxTokens = Number(modelInfo.maxTokens)
		}

		const stream = await client.chat.completions.create({
			model: modelId,
			messages: openAiMessages,
			temperature,
			max_tokens: maxTokens,
			stream: true,
			stream_options: { include_usage: true },
			...getOpenAIToolParams(tools),
		})

		const toolCallProcessor = new ToolCallProcessor()

		for await (const chunk of stream) {
			const delta = chunk.choices?.[0]?.delta
			if (delta?.content) {
				yield {
					type: "text",
					text: delta.content,
				}
			}

			if (delta?.tool_calls) {
				yield* toolCallProcessor.processToolCallDeltas(delta.tool_calls)
			}

			if (chunk.usage) {
				yield {
					type: "usage",
					inputTokens: chunk.usage.prompt_tokens || 0,
					outputTokens: chunk.usage.completion_tokens || 0,
				}
			}
		}
	}

	getModel(): ApiHandlerModel {
		const modelId = this.options.sarvamModelId ?? sarvamDefaultModelId
		return {
			id: modelId,
			info: this.options.sarvamModelInfo ?? sarvamModels[modelId as keyof typeof sarvamModels] ?? sarvamModels[sarvamDefaultModelId],
		}
	}
}
