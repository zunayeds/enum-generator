import { LANGUAGE_CONFIG_MAPPINGS } from '../constants';
import { Language } from '../enums';
import { CodeFile, GenericEnum, LanguageConfigurationBase } from '../models';
import { FileService } from '../services';

export abstract class EnumConverterBase {
	protected readonly languageConfiguration: LanguageConfigurationBase;

	constructor(protected readonly language: Language) {
		this.languageConfiguration = LANGUAGE_CONFIG_MAPPINGS[this.language];
	}

	abstract convertEnum(genericEnum: GenericEnum): Promise<string>;

	public async convertEnumsToString(
		genericEnums: GenericEnum[]
	): Promise<string> {
		return await this.convertEnumsToStringInternal(genericEnums);
	}

	public async convertEnumsToFiles(
		genericEnums: GenericEnum[]
	): Promise<CodeFile[]> {
		return await this.convertEnumsToFilesInternal(genericEnums);
	}

	protected async convertEnumsToStringInternal(
		genericEnums: GenericEnum[]
	): Promise<string> {
		let fileContents: string[] = [];

		const promises = genericEnums.map(async genericEnum => {
			const content = await this.convertEnum(genericEnum);
			fileContents.push(content);
		});

		await Promise.all(promises);

		return fileContents.join('\n\n');
	}

	protected async convertEnumsToFilesInternal(
		genericEnums: GenericEnum[]
	): Promise<CodeFile[]> {
		let fileContents: CodeFile[] = [];

		const promises = genericEnums.map(async genericEnum => {
			const content = await this.convertEnum(genericEnum);

			fileContents.push({
				fileName: FileService.generateFileName(
					genericEnum.name,
					this.languageConfiguration
				),
				fileContent: content
			});
		});

		await Promise.all(promises);

		return fileContents;
	}
}
