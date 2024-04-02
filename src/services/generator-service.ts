import { FileGenerationInfo } from '../models';

export abstract class GeneratorService {
	/* istanbul ignore next */
	constructor() {}

	private static generatedFiles: string[] = [];
	private static generationFailedFiles: string[] = [];
	private static invalidEnums: string[] = [];
	private static unsupportedEnums: string[] = [];
	private static experimentalEnums: string[] = [];

	public static addGeneratedFile(name: string): void {
		this.generatedFiles.push(name);
	}

	public static addGenerationFailedFile(name: string): void {
		this.generationFailedFiles.push(name);
	}

	public static addInvalidEnum(name: string): void {
		this.invalidEnums.push(name);
	}

	public static addUnsupportedEnum(name: string): void {
		this.unsupportedEnums.push(name);
	}

	public static addExperimentalEnum(name: string): void {
		this.experimentalEnums.push(name);
	}

	public static getFileGenerationInfo(): FileGenerationInfo {
		return {
			generatedFiles: this.generatedFiles,
			invalidEnums: this.invalidEnums,
			geneartionFailedFiles: this.generationFailedFiles,
			unsupportedEnums: this.unsupportedEnums,
			experimentalEnums: this.experimentalEnums
		};
	}
}
