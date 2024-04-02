import { EnumConverterBase } from '../../src/converters/converter-base';
import { EnumType, Language } from '../../src/enums';
import { GenericEnum } from '../../src/models';

// mock all implemented conveters
jest.mock('../../src/converters/dart-converter');

// test class that extends EnumConverterBase
class TestEnumConverter extends EnumConverterBase {
	constructor() {
		super(Language.TypeScript);
	}

	convertEnum(genericEnum: GenericEnum): Promise<string> {
		let stringEnum = `enum ${genericEnum.name} {\n\t`;

		stringEnum += genericEnum.items.map(item => item.name).join(',\n\t');

		stringEnum += '\n}';

		return Promise.resolve(stringEnum);
	}
}

describe('EnumConverterBase', () => {
	let converter: EnumConverterBase;

	beforeEach(() => {
		// Create an instance of EnumConverterBase with a specific language
		converter = new TestEnumConverter();
	});

	it('should convert a list of generic enums to a string', async () => {
		const genericEnums: GenericEnum[] = [
			{
				name: 'MyEnum1',
				type: EnumType.General,
				items: [
					{
						name: 'Value1',
						value: 1
					},
					{
						name: 'Value2',
						value: 2
					},
					{
						name: 'Value3',
						value: 3
					}
				]
			},
			{
				name: 'MyEnum2',
				type: EnumType.General,
				items: [
					{
						name: 'Value4',
						value: 4
					},
					{
						name: 'Value5',
						value: 5
					},
					{
						name: 'Value6',
						value: 6
					}
				]
			}
		];

		const expectedOutput = `enum MyEnum1 {\n\tValue1,\n\tValue2,\n\tValue3\n}\n\nenum MyEnum2 {\n\tValue4,\n\tValue5,\n\tValue6\n}`;

		const result = await converter.convertEnumsToString(genericEnums);

		expect(result).toEqual(expectedOutput);
	});

	it('should convert a list of generic enums to a list of code files', async () => {
		const genericEnums: GenericEnum[] = [
			{
				name: 'MyEnum1',
				type: EnumType.General,
				items: [
					{
						name: 'Value1',
						value: 1
					},
					{
						name: 'Value2',
						value: 2
					},
					{
						name: 'Value3',
						value: 3
					}
				]
			},
			{
				name: 'MyEnum2',
				type: EnumType.General,
				items: [
					{
						name: 'Value4',
						value: 4
					},
					{
						name: 'Value5',
						value: 5
					},
					{
						name: 'Value6',
						value: 6
					}
				]
			}
		];

		const result = await converter.convertEnumsToFiles(genericEnums);

		expect(result).toHaveLength(2);
		expect(result[0].fileName).toEqual('myEnum1.ts');
		expect(result[0].fileContent).toEqual(
			`enum MyEnum1 {\n\tValue1,\n\tValue2,\n\tValue3\n}`
		);
		expect(result[1].fileName).toEqual('myEnum2.ts');
		expect(result[1].fileContent).toEqual(
			`enum MyEnum2 {\n\tValue4,\n\tValue5,\n\tValue6\n}`
		);
	});
});
