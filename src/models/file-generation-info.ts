export interface FileGenerationInfo {
	generatedFiles: string[];
	generationFailedFiles: string[];
	invalidEnums: string[];
	unsupportedEnums: string[];
	experimentalEnums: string[];
}
