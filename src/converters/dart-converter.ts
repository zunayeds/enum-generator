import { EnumConverterBase } from '.';
import { EnumType, Language } from '../enums';
import { StringHelper, TypeHelper } from '../utilities';
import { GenericEnum } from '../models';
import { ConfigService } from '../services';
import { GeneratorService } from '../services/generator-service';

export class DartConverter extends EnumConverterBase {
	constructor() {
		super(Language.Dart);
	}

	async convertEnum(genericEnum: GenericEnum): Promise<string> {
		let fileContent: string = '';

		if (genericEnum.type === EnumType.General) {
			fileContent += `enum ${genericEnum.name} {`;

			genericEnum.items.forEach(enumItem => {
				fileContent += `\n\t${enumItem.name},`;
			});
		} else if (await ConfigService.isExpermentalEnumGenerationEnabled()) {
			fileContent += `abstract class ${genericEnum.name} {`;

			genericEnum.items.forEach(enumItem => {
				fileContent += '\n\t';
				const isNumber = TypeHelper.isNumber(enumItem.value);
				fileContent += `static ${isNumber ? 'int' : 'String'} get ${enumItem.name} => ${isNumber ? enumItem.value : StringHelper.addQuotation(enumItem.value)};`;
			});

			GeneratorService.addExperimentalEnum(genericEnum.name);
		} else {
			GeneratorService.addUnsupportedEnum(genericEnum.name);
		}

		fileContent += '\n}';

		return fileContent;
	}
}
