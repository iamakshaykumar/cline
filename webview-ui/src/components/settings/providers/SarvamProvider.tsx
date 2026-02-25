import { sarvamModels } from "@shared/api"
import { Mode } from "@shared/storage/types"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { ApiKeyField } from "../common/ApiKeyField"
import { BaseUrlField } from "../common/BaseUrlField"
import { DebouncedTextField } from "../common/DebouncedTextField"
import { ModelInfoView } from "../common/ModelInfoView"
import { ModelSelector } from "../common/ModelSelector"
import { getModeSpecificFields, normalizeApiConfiguration } from "../utils/providerUtils"
import { useApiConfigurationHandlers } from "../utils/useApiConfigurationHandlers"

interface SarvamProviderProps {
	showModelOptions: boolean
	isPopup?: boolean
	currentMode: Mode
}

export const SarvamProvider = ({ showModelOptions, isPopup, currentMode }: SarvamProviderProps) => {
	const { apiConfiguration } = useExtensionState()
	const { handleFieldChange, handleModeFieldChange } = useApiConfigurationHandlers()

	const { selectedModelId, selectedModelInfo } = normalizeApiConfiguration(apiConfiguration, currentMode)
	const { sarvamModelInfo } = getModeSpecificFields(apiConfiguration, currentMode)

	return (
		<div>
			<BaseUrlField
				initialValue={apiConfiguration?.sarvamBaseUrl || "https://api.sarvam.ai/v1"}
				onChange={(value) => handleFieldChange("sarvamBaseUrl", value)}
				label="Base URL"
				placeholder="https://api.sarvam.ai/v1"
			/>

			<ApiKeyField
				initialValue={apiConfiguration?.sarvamApiKey || ""}
				onChange={(value) => handleFieldChange("sarvamApiKey", value)}
				providerName="Sarvam AI"
				signupUrl="https://www.sarvam.ai/"
			/>

			{showModelOptions && (
				<>
					<ModelSelector
						label="Model"
						models={sarvamModels}
						onChange={(e: any) =>
							handleModeFieldChange(
								{ plan: "planModeSarvamModelId", act: "actModeSarvamModelId" },
								e.target.value,
								currentMode,
							)
						}
						selectedModelId={selectedModelId}
					/>

					<div style={{ display: "flex", gap: 10, marginTop: "5px" }}>
						<DebouncedTextField
							initialValue={
								sarvamModelInfo?.maxTokens
									? sarvamModelInfo.maxTokens.toString()
									: (selectedModelInfo.maxTokens?.toString() ?? "")
							}
							onChange={(value) => {
								const modelInfo = sarvamModelInfo ? { ...sarvamModelInfo } : { ...selectedModelInfo }
								modelInfo.maxTokens = Number(value)
								handleModeFieldChange(
									{ plan: "planModeSarvamModelInfo", act: "actModeSarvamModelInfo" },
									modelInfo,
									currentMode,
								)
							}}
							style={{ flex: 1 }}>
							<span style={{ fontWeight: 500 }}>Max Output Tokens</span>
						</DebouncedTextField>

						<DebouncedTextField
							initialValue={
								sarvamModelInfo?.temperature
									? sarvamModelInfo.temperature.toString()
									: (selectedModelInfo.temperature?.toString() ?? "")
							}
							onChange={(value) => {
								const modelInfo = sarvamModelInfo ? { ...sarvamModelInfo } : { ...selectedModelInfo }
								modelInfo.temperature = Number(value)
								handleModeFieldChange(
									{ plan: "planModeSarvamModelInfo", act: "actModeSarvamModelInfo" },
									modelInfo,
									currentMode,
								)
							}}
							style={{ flex: 1 }}>
							<span style={{ fontWeight: 500 }}>Temperature</span>
						</DebouncedTextField>
					</div>

					<ModelInfoView isPopup={isPopup} modelInfo={selectedModelInfo} selectedModelId={selectedModelId} />
				</>
			)}
		</div>
	)
}
