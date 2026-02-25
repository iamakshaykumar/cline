import { expect } from "chai"
import { SarvamHandler } from "../sarvam"
import { ModelInfo, sarvamDefaultModelId } from "../../../../../src/shared/api"

describe("SarvamHandler", () => {
    const mockOptions = {
        sarvamApiKey: "test-key",
        sarvamBaseUrl: "https://api.sarvam.ai/v1",
        sarvamModelId: "sarvam-m",
        sarvamModelInfo: {
            maxTokens: 1024,
            contextWindow: 8192,
            supportsImages: false,
            supportsPromptCache: false,
            inputPrice: 0,
            outputPrice: 0,
            temperature: 0.5
        } as ModelInfo
    }

    it("should initialize with correct options", () => {
        const handler = new SarvamHandler(mockOptions)
        expect(handler).to.be.instanceOf(SarvamHandler)
        const model = handler.getModel()
        expect(model.id).to.equal(mockOptions.sarvamModelId)
        expect(model.info).to.deep.equal(mockOptions.sarvamModelInfo)
    })

    it("should use default model if not provided", () => {
        const handler = new SarvamHandler({
            sarvamApiKey: "test-key"
        })
        const model = handler.getModel()
        expect(model.id).to.equal(sarvamDefaultModelId)
    })

    it("should throw error if API key is missing", () => {
        const handler = new SarvamHandler({})
        // @ts-ignore - Accessing private method for testing logic that would run on ensureClient
        expect(() => handler["ensureClient"]()).to.throw("Sarvam API key is required")
    })
})
