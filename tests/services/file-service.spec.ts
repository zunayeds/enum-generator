import { EnumType, StringCasingType } from '../../src/enums';
import { LanguageConfigurationBase } from '../../src/models';
import { FileService } from '../../src/services/file-service';
import { readFileSync, writeFileSync } from 'fs';

jest.mock('fs');

describe('FileService', () => {
	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('readFile', () => {
		it('should read file', () => {
			const mockFilePath = 'path/to/file';
			const mockFileContent = 'file content';

			(readFileSync as jest.Mock).mockReturnValue(
				Buffer.from(mockFileContent)
			);

			const result = FileService.readFile(mockFilePath);

			expect(readFileSync).toHaveBeenCalledWith(mockFilePath);
			expect(result).toBe(mockFileContent);
		});
	});

	describe('writeIntoFile', () => {
		it('should write into file', () => {
			const mockFilePath = 'path/to/file';
			const mockFileContent = 'file content';

			FileService.writeIntoFile(mockFilePath, mockFileContent);

			expect(writeFileSync).toHaveBeenCalledWith(
				mockFilePath,
				mockFileContent,
				{
					encoding: 'utf-8',
					flag: 'w+'
				}
			);
		});
	});

	describe('generateFileName', () => {
		const name = 'testName';
		const fileExtension = 'txt';

		const cases: [StringCasingType, string][] = [
			[StringCasingType.CamelCase, 'testName.txt'],
			[StringCasingType.KebabCase, 'test-name.txt'],
			[StringCasingType.PascalCase, 'TestName.txt'],
			[StringCasingType.SnakeCase, 'test_name.txt']
		];

		cases.forEach(([casing, expected]) => {
			it(`should generate file name in ${casing}`, () => {
				const config: LanguageConfigurationBase = {
					fileNameCasing: casing,
					fileExtension: fileExtension,
					supportedEnumTypes: [EnumType.General],
					itemCasing: casing,
					nameCasing: casing
				};

				const result = FileService.generateFileName(name, config);

				expect(result).toBe(expected);
			});
		});
	});

	describe('getFileNameFromPath', () => {
		it('should get file name with extension', () => {
			const filePath = '/path/to/file.txt';
			const result = FileService.getFileNameFromPath(filePath);
			expect(result).toBe('file.txt');
		});

		it('should get file name without extension', () => {
			const filePath = '/path/to/file.txt';
			const result = FileService.getFileNameFromPath(filePath, false);
			expect(result).toBe('file');
		});

		it('should handle Windows path separators', () => {
			const filePath = '\\path\\to\\file.txt';
			const result = FileService.getFileNameFromPath(filePath);
			expect(result).toBe('file.txt');
		});

		it('should return the original file name if it does not contain any separators', () => {
			const filePath = 'file.txt';
			const result = FileService.getFileNameFromPath(filePath);
			expect(result).toBe('file.txt');
		});

		it('should return an empty string if the file path is empty', () => {
			const filePath = '';
			const result = FileService.getFileNameFromPath(filePath);
			expect(result).toBe('');
		});
	});
});
