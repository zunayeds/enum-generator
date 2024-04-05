import { EnumParserBase } from '../../src/parsers/parser-base';
import { EnumType, Language } from '../../src/enums';
import { GenericEnumItem } from '../../src/models';
import { GeneratorService } from '../../src/services';

// mock all implemented parsers
jest.mock('../../src/parsers/csharp-parser');
jest.mock('../../src/parsers/javascript-parser');

// test class that extends EnumParserBase
class TestEnumParser extends EnumParserBase {
	constructor() {
		super(Language.TypeScript);
	}

	parseEnumBody(enumBody: string): GenericEnumItem[] {
		const itemRegex = this.languageConfiguration
			.enumBodyParserRegex as RegExp;
		let match;
		const items: GenericEnumItem[] = [];
		let lastNumericValue = -1; // Start before 0, as the first value (if not set) should be 0.

		while ((match = itemRegex.exec(enumBody)) !== null) {
			const itemName = match[1];
			const itemValueStr = match[2];
			let itemValue: string | number;

			if (itemValueStr !== undefined) {
				// Check if the value is numeric or a string and remove quotes if necessary
				const parsedValue =
					itemValueStr.trim().startsWith("'") ||
					itemValueStr.trim().startsWith('"')
						? itemValueStr.trim().slice(1, -1)
						: isNaN(Number(itemValueStr))
							? itemValueStr.trim()
							: Number(itemValueStr);

				itemValue = parsedValue;
				if (typeof parsedValue === 'number') {
					lastNumericValue = parsedValue;
				}
			} else {
				// If no value is explicitly set, increment from the last numeric value
				itemValue = ++lastNumericValue;
			}

			items.push({ name: itemName, value: itemValue });
		}

		return items;
	}
}

describe('EnumParserBase', () => {
	let parser: EnumParserBase;

	beforeEach(() => {
		parser = new TestEnumParser();
	});

	describe('parseEnumBody', () => {
		it('should parse the enum body and return an array of GenericEnumItem', () => {
			const enumBody = `
                VALUE1 = 1,
                VALUE2 = 2,
                VALUE3 = 3,
            `;
			const expectedItems = [
				{ name: 'VALUE1', value: 1 },
				{ name: 'VALUE2', value: 2 },
				{ name: 'VALUE3', value: 3 }
			];

			const result = parser.parseEnumBody(enumBody);

			expect(result).toEqual(expectedItems);
		});
	});

	describe('parseFileContent', () => {
		it('should parse the file content and return an array of GenericEnum', () => {
			const fileContent = `
                enum MyEnum {
                    VALUE1 = 1,
                    VALUE2 = 2,
                    VALUE3 = 3,
                }

				enum MyEnum2 {
					VALUE4 = 4,
					VALUE5 = "Five",
					VALUE6 = 6,
				}

				enum MyEnum3 {
					VALUE0,
					VALUE1,
					VALUE2,
				}

				enum MyEnum4 {
					VALUE0 = "Zero",
					VALUE1 = "One",
					VALUE2 = "Two",
				}
            `;
			const expectedEnums = [
				{
					name: 'MyEnum',
					type: EnumType.Numeric,
					items: [
						{ name: 'VALUE1', value: 1 },
						{ name: 'VALUE2', value: 2 },
						{ name: 'VALUE3', value: 3 }
					]
				},
				{
					name: 'MyEnum2',
					type: EnumType.Heterogeneous,
					items: [
						{ name: 'VALUE4', value: 4 },
						{ name: 'VALUE5', value: 'Five' },
						{ name: 'VALUE6', value: 6 }
					]
				},
				{
					name: 'MyEnum3',
					type: EnumType.General,
					items: [
						{ name: 'VALUE0', value: 0 },
						{ name: 'VALUE1', value: 1 },
						{ name: 'VALUE2', value: 2 }
					]
				},
				{
					name: 'MyEnum4',
					type: EnumType.String,
					items: [
						{ name: 'VALUE0', value: 'Zero' },
						{ name: 'VALUE1', value: 'One' },
						{ name: 'VALUE2', value: 'Two' }
					]
				}
			];

			const result = parser.parseFileContent(fileContent);

			expect(result).toEqual(expectedEnums);
		});

		it('should skip parsing the enum in file content where items are missing', () => {
			const fileContent = `
                enum MyEnum {
                    VALUE1 = 1,
                    VALUE2 = 2,
                    VALUE3 = 3,
                }

				enum MyEnum2 {
				}
            `;
			const expectedEnums = [
				{
					name: 'MyEnum',
					type: EnumType.Numeric,
					items: [
						{ name: 'VALUE1', value: 1 },
						{ name: 'VALUE2', value: 2 },
						{ name: 'VALUE3', value: 3 }
					]
				}
			];

			jest.spyOn(GeneratorService, 'addInvalidEnum');

			const result = parser.parseFileContent(fileContent);

			expect(result).toEqual(expectedEnums);
			expect(GeneratorService.addInvalidEnum).toHaveBeenCalledWith(
				'MyEnum2'
			);
		});

		fit('should skip parsing the enum in file content where items are in invalid form', () => {
			const fileContent = `
                enum MyEnum {
                    VALUE1 = 1,
                    VALUE2 = 2,
                    VALUE3 = 3,
                }

				enum MyEnum2 {
					VALUE4: 4
				}
            `;
			const expectedEnums = [
				{
					name: 'MyEnum',
					type: EnumType.Numeric,
					items: [
						{ name: 'VALUE1', value: 1 },
						{ name: 'VALUE2', value: 2 },
						{ name: 'VALUE3', value: 3 }
					]
				}
			];

			jest.spyOn(GeneratorService, 'addInvalidEnum');

			const result = parser.parseFileContent(fileContent);

			expect(result).toEqual(expectedEnums);
			expect(GeneratorService.addInvalidEnum).toHaveBeenCalledWith(
				'MyEnum2'
			);
		});
	});
});
