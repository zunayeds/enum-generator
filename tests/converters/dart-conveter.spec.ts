import { DartConverter } from '../../src/converters';
import { EnumType } from '../../src/enums';
import { GenericEnum } from '../../src/models';
import {
	ConfigService,
	FileService,
	GeneratorService
} from '../../src/services';
import { DART_CONFIGURATION } from '../../src/constants/language-configurations';

describe('DartConverter', () => {
	let converter: DartConverter;

	beforeEach(() => {
		converter = new DartConverter();
	});

	describe('convertEnumsToFiles', () => {
		it('should convert a list of generic enums to a list of code files', async () => {
			const genericEnums: GenericEnum[] = [
				{
					name: 'TestEnum',
					type: EnumType.General,
					items: [
						{ name: 'Item1', value: '1' },
						{ name: 'Item2', value: '2' }
					]
				}
			];

			const result = await converter.convertEnumsToFiles(genericEnums);

			expect(result).toBeInstanceOf(Array);
			expect(result).toHaveLength(genericEnums.length);
			result.forEach((file, index) => {
				expect(file.fileName).toBe(
					FileService.generateFileName(
						genericEnums[index].name,
						DART_CONFIGURATION
					)
				);
				expect(file.fileContent).toContain(
					`enum ${genericEnums[index].name} {`
				);
				genericEnums[index].items.forEach(item => {
					expect(file.fileContent).toContain(`\n\t${item.name},`);
				});
				expect(file.fileContent).toContain('\n}');
			});
		});
	});

	describe('convertEnum', () => {
		it('should convert a generic enum to a string', async () => {
			const genericEnum: GenericEnum = {
				name: 'TestEnum',
				type: EnumType.General,
				items: [
					{ name: 'Item1', value: '1' },
					{ name: 'Item2', value: '2' }
				]
			};

			jest.spyOn(
				ConfigService,
				'isExpermentalEnumGenerationEnabled'
			).mockResolvedValue(false);

			const result = await converter.convertEnum(genericEnum);

			expect(result).toContain(`enum ${genericEnum.name} {`);
			genericEnum.items.forEach(item => {
				expect(result).toContain(`\n\t${item.name},`);
			});
			expect(result).toContain('\n}');
		});

		it('should convert an unsupported enum with abstract class when expermental enum generation is enabled', async () => {
			const heterogeneous: GenericEnum = {
				type: EnumType.Heterogeneous,
				name: 'Color',
				items: [
					{ name: 'Red', value: 'Red' },
					{ name: 'Green', value: 2 },
					{ name: 'Blue', value: 'Blue' }
				]
			};

			const expectedOutput = `abstract class Color {\n\tstatic String get Red => "Red";\n\tstatic int get Green => 2;\n\tstatic String get Blue => "Blue";\n}`;

			jest.spyOn(
				ConfigService,
				'isExpermentalEnumGenerationEnabled'
			).mockResolvedValue(true);
			jest.spyOn(GeneratorService, 'addExperimentalEnum');

			const result = await converter.convertEnum(heterogeneous);

			expect(result).toBe(expectedOutput);
			expect(GeneratorService.addExperimentalEnum).toHaveBeenCalledWith(
				heterogeneous.name
			);
		});

		it('should not convert an unsupported enum when expermental enum generation is not enabled', async () => {
			const heterogeneous: GenericEnum = {
				type: EnumType.Heterogeneous,
				name: 'Color',
				items: [
					{ name: 'Red', value: 'Red' },
					{ name: 'Green', value: 2 },
					{ name: 'Blue', value: 'Blue' }
				]
			};

			jest.spyOn(
				ConfigService,
				'isExpermentalEnumGenerationEnabled'
			).mockResolvedValue(false);
			jest.spyOn(GeneratorService, 'addUnsupportedEnum');

			const result = await converter.convertEnum(heterogeneous);

			expect(GeneratorService.addUnsupportedEnum).toHaveBeenCalledWith(
				heterogeneous.name
			);
		});
	});
});
