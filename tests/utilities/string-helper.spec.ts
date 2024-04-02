import { StringHelper } from '../../src/utilities';

describe('StringHelper', () => {
	describe('isNullOrWhitespace', () => {
		it('should return true if the string is null or whitespace', () => {
			expect(StringHelper.isNullOrWhitespace('')).toBe(true);
			expect(StringHelper.isNullOrWhitespace(' ')).toBe(true);
			const nullableString: string | null = null;
			expect(
				StringHelper.isNullOrWhitespace(
					nullableString as unknown as string
				)
			).toBe(true);
		});

		it('should return false if the string is not null or whitespace', () => {
			expect(StringHelper.isNullOrWhitespace('test')).toBe(false);
		});
	});

	describe('convertToCamelCase', () => {
		it('should convert the string to camel case', () => {
			expect(StringHelper.convertToCamelCase('test string')).toBe(
				'testString'
			);
		});
	});

	describe('convertToPascalCase', () => {
		it('should convert the string to pascal case', () => {
			expect(StringHelper.convertToPascalCase('test string')).toBe(
				'TestString'
			);
		});
	});

	describe('convertToKebabCase', () => {
		it('should convert the string to kebab case', () => {
			expect(StringHelper.convertToKebabCase('test string')).toBe(
				'test-string'
			);
		});
	});

	describe('convertToSnakeCase', () => {
		it('should convert the string to snake case', () => {
			expect(StringHelper.convertToSnakeCase('test string')).toBe(
				'test_string'
			);
		});
	});

	describe('addQuotation', () => {
		it('should add double quotes when doubleQuote is true', () => {
			const result = StringHelper.addQuotation('test', true);
			expect(result).toBe('"test"');
		});

		it('should add single quotes when doubleQuote is false', () => {
			const result = StringHelper.addQuotation('test', false);
			expect(result).toBe("'test'");
		});

		it('should add double quotes when doubleQuote is not provided', () => {
			const result = StringHelper.addQuotation('test');
			expect(result).toBe('"test"');
		});

		it('should convert number to string and add double quotes', () => {
			const result = StringHelper.addQuotation(123, true);
			expect(result).toBe('"123"');
		});

		it('should convert number to string and add single quotes', () => {
			const result = StringHelper.addQuotation(123, false);
			expect(result).toBe("'123'");
		});
	});

	describe('convertToCommaSeparatedString', () => {
		it('should convert an array of strings to a comma-separated string', () => {
			const input = ['apple', 'banana', 'cherry'];
			const result = StringHelper.convertToCommaSeparatedString(input);
			expect(result).toBe('apple, banana, cherry');
		});

		it('should return an empty string if the input array is empty', () => {
			const input: string[] = [];
			const result = StringHelper.convertToCommaSeparatedString(input);
			expect(result).toBe('');
		});

		it('should handle an array with a single element', () => {
			const input = ['apple'];
			const result = StringHelper.convertToCommaSeparatedString(input);
			expect(result).toBe('apple');
		});
	});
});
