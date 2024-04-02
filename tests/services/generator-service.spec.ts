import { FileGenerationInfo } from '../../src/models';
import { GeneratorService } from '../../src/services';

describe('GeneratorService', () => {
	it('should add a generated file', () => {
		const fileName = 'example.ts';
		GeneratorService.addGeneratedFile(fileName);
		expect(
			GeneratorService.getFileGenerationInfo().generatedFiles
		).toContain(fileName);
	});

	it('should add a generation failed file', () => {
		const fileName = 'example.ts';
		GeneratorService.addGenerationFailedFile(fileName);
		expect(
			GeneratorService.getFileGenerationInfo().generationFailedFiles
		).toContain(fileName);
	});

	it('should add an invalid enum', () => {
		const enumName = 'ExampleEnum';
		GeneratorService.addInvalidEnum(enumName);
		expect(GeneratorService.getFileGenerationInfo().invalidEnums).toContain(
			enumName
		);
	});

	it('should add an unsupported enum', () => {
		const enumName = 'ExampleEnum';
		GeneratorService.addUnsupportedEnum(enumName);
		expect(
			GeneratorService.getFileGenerationInfo().unsupportedEnums
		).toContain(enumName);
	});

	it('should add an experimental enum', () => {
		const enumName = 'ExampleEnum';
		GeneratorService.addExperimentalEnum(enumName);
		expect(
			GeneratorService.getFileGenerationInfo().experimentalEnums
		).toContain(enumName);
	});
});
