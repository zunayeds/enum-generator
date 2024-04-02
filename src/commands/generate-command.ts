import {
	ConfigService,
	FileService,
	FolderService,
	GeneratorService
} from '../services';
import {
	LANGUAGE_CONFIG_MAPPINGS,
	LANGUAGE_ENGINE_MAPPINGS,
	SUPPORTED_SOURCE_LANGUAGES,
	SUPPORTED_TARGET_LANGUAGES
} from '../constants';
import { EnumConverterBase } from '../converters';
import { Language } from '../enums';
import {
	CodeFile,
	LanguageConfigurationBase,
	LanguageEngineConfigurationBase
} from '../models';
import { EnumParserBase } from '../parsers';
import { ErrorHandler, StringHelper } from '../utilities';
import { LogService } from '../services/log-service';
import {
	INVALID_ENUM_MESSAGE,
	FILE_GENERATION_FAILED_FORMAT_MESSAGE,
	INVALID_SOURCE_DIRECTORY_MESSAGE,
	MISSING_ENUM_CONVERTER_IMPLEMENTATION_MESSAGE,
	MISSING_ENUM_PARSER_IMPLEMENTATION_MESSAGE,
	SAME_SOURCE_AND_TARGET_DIRECTORY_MESSAGE,
	SAME_SOURCE_AND_TARGET_LANGUAGE_MESSAGE,
	SOURCE_LANGUAGE_REQUIRED_MESSAGE,
	TARGET_LANGUAGE_REQUIRED_MESSAGE,
	UNSUPPORTED_SOURCE_LANGUAGE_MESSAGE,
	UNSUPPORTED_TARGET_LANGUAGE_MESSAGE,
	Unsupported_ENUM_MESSAGE
} from '../constants/messages/error-messages';
import { FILE_GENERATION_SUCCESS_FORMAT_MESSAGE } from '../constants/messages/success-messages';
import { EXPERIMENTAL_ENUM_GENERATION_FORMAT_MESSAGE } from '../constants/messages/warning-messages';

export abstract class GenerateCommand {
	private constructor() {}

	private static sourceDirectory: string;
	private static sourceLanguage: Language;
	private static targetDirectory: string;
	private static targetLanguage: Language;
	private static sourceLanguageConfiguration: LanguageConfigurationBase;
	private static targetLanguageConfiguration: LanguageConfigurationBase;
	private static sourceLanguageEngine: LanguageEngineConfigurationBase;
	private static targetLanguageEngine: LanguageEngineConfigurationBase;
	private static enumParser: EnumParserBase;
	private static enumConverter: EnumConverterBase;

	public static async generateFiles(
		source: string,
		sourceLanguage: string,
		target: string,
		targetLanguage: string
	): Promise<void> {
		await this.validateCommandParamters(
			source,
			sourceLanguage,
			target,
			targetLanguage
		);

		await this.setGeneratorProperties();

		const filesToProcess = FolderService.getFiles(
			this.sourceDirectory,
			this.sourceLanguageConfiguration.fileExtension
		);

		if (filesToProcess.length) {
			let files: CodeFile[] = [];
			let promises: Promise<void>[] = [];

			const separateFileForEachType =
				(await ConfigService.getSpecificConfiguration(
					'separateFileForEachType'
				)) as boolean;

			if (separateFileForEachType) {
				promises = filesToProcess.map(async file => {
					const fileContent = FileService.readFile(file);
					const genericEnums =
						this.enumParser.parseFileContent(fileContent);
					files = files.concat(
						await this.enumConverter.convertEnumsToFiles(
							genericEnums
						)
					);
				});
			} else {
				filesToProcess.forEach(async file => {
					const fileContent = FileService.readFile(file);
					const genericEnums =
						this.enumParser.parseFileContent(fileContent);
					const fileName = FileService.getFileNameFromPath(
						file,
						false
					);
					files.push({
						fileName: FileService.generateFileName(
							fileName,
							this.targetLanguageConfiguration
						),
						fileContent:
							await this.enumConverter.convertEnumsToString(
								genericEnums
							)
					});
				});
			}

			await Promise.all(promises);

			files.forEach(file => {
				const fullPath = `${this.targetDirectory}${FolderService.getSeparator(this.targetDirectory)}${file.fileName}`;
				try {
					FileService.writeIntoFile(fullPath, file.fileContent);
					GeneratorService.addGeneratedFile(file.fileName);
				} catch (error) {
					GeneratorService.addGenerationFailedFile(file.fileName);
				}
			});

			await this.logGenerationInfo();
		}
	}

	private static async validateCommandParamters(
		source: string,
		sourceLanguage: string,
		target: string,
		targetLanguage: string
	): Promise<void> {
		try {
			const config = await ConfigService.getConfigurations();

			if (!FolderService.isValidDirectory(source)) {
				throw new Error(INVALID_SOURCE_DIRECTORY_MESSAGE);
			}

			if (source === target) {
				throw new Error(SAME_SOURCE_AND_TARGET_DIRECTORY_MESSAGE);
			}

			if (
				StringHelper.isNullOrWhitespace(sourceLanguage) &&
				!config.defaultSourceLanguage
			) {
				throw new Error(SOURCE_LANGUAGE_REQUIRED_MESSAGE);
			} else if (!SUPPORTED_SOURCE_LANGUAGES.includes(sourceLanguage)) {
				throw new Error(UNSUPPORTED_SOURCE_LANGUAGE_MESSAGE);
			}

			if (
				StringHelper.isNullOrWhitespace(targetLanguage) &&
				!config.defaultTargetLanguage
			) {
				throw new Error(TARGET_LANGUAGE_REQUIRED_MESSAGE);
			} else if (!SUPPORTED_TARGET_LANGUAGES.includes(targetLanguage)) {
				throw new Error(UNSUPPORTED_TARGET_LANGUAGE_MESSAGE);
			}

			if (sourceLanguage === targetLanguage) {
				throw new Error(SAME_SOURCE_AND_TARGET_LANGUAGE_MESSAGE);
			}

			sourceLanguage == sourceLanguage ?? config.defaultSourceLanguage;
			targetLanguage == targetLanguage ?? config.defaultTargetLanguage;

			this.sourceDirectory = source;
			this.sourceLanguage = sourceLanguage as Language;
			this.targetDirectory = target;
			this.targetLanguage = targetLanguage as Language;
		} catch (error: unknown) {
			await ErrorHandler.handle(error);
		}
	}

	private static async setGeneratorProperties(): Promise<void> {
		try {
			this.sourceLanguageConfiguration =
				LANGUAGE_CONFIG_MAPPINGS[this.sourceLanguage];
			this.targetLanguageConfiguration =
				LANGUAGE_CONFIG_MAPPINGS[this.targetLanguage];
			this.sourceLanguageEngine =
				LANGUAGE_ENGINE_MAPPINGS[this.sourceLanguage];
			this.targetLanguageEngine =
				LANGUAGE_ENGINE_MAPPINGS[this.targetLanguage];

			if (this.sourceLanguageEngine.enumParser) {
				this.enumParser = new this.sourceLanguageEngine.enumParser();
			} else {
				throw new Error(MISSING_ENUM_PARSER_IMPLEMENTATION_MESSAGE);
			}

			if (this.targetLanguageEngine.enumConverter) {
				this.enumConverter =
					new this.targetLanguageEngine.enumConverter();
			} else {
				throw new Error(MISSING_ENUM_CONVERTER_IMPLEMENTATION_MESSAGE);
			}
		} catch (error: unknown) {
			await ErrorHandler.handle(error);
		}
	}

	private static async logGenerationInfo(): Promise<void> {
		const generationInfo = GeneratorService.getFileGenerationInfo();

		if (generationInfo.generatedFiles.length) {
			await LogService.showSuccessMessage(
				FILE_GENERATION_SUCCESS_FORMAT_MESSAGE(
					generationInfo.generatedFiles
				)
			);
		}
		if (generationInfo.experimentalEnums.length) {
			await LogService.showWarningMessage(
				EXPERIMENTAL_ENUM_GENERATION_FORMAT_MESSAGE(
					generationInfo.experimentalEnums
				)
			);
		}
		if (generationInfo.generationFailedFiles.length) {
			await LogService.showErrorMessage(
				FILE_GENERATION_FAILED_FORMAT_MESSAGE(
					generationInfo.generationFailedFiles
				)
			);
		}
		if (generationInfo.invalidEnums.length) {
			await LogService.showErrorMessage(
				INVALID_ENUM_MESSAGE(generationInfo.invalidEnums)
			);
		}
		if (generationInfo.unsupportedEnums.length) {
			await LogService.showErrorMessage(
				Unsupported_ENUM_MESSAGE(generationInfo.unsupportedEnums)
			);
		}
	}
}
