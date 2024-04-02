import { ConfigService } from '../../src/services/config-service';
import {
	DEFAULT_GENERATOR_CONFIGURATION,
	GENERATOR_CONFIGURATION_SCHEMA,
	GENERATOR_PROJECT_NAME
} from '../../src/constants';
import {
	INVALID_CONFIG_KEY_MESSAGE,
	INVALID_CONFIG_VALUE_TYPE_MESSAGE,
	INVALID_ENUM_CONFIG_VALUE_MESSAGE
} from '../../src/constants/messages/error-messages';
import { Language } from '../../src/enums';

const separateFileForEachType = 'separateFileForEachType';

jest.mock('../../src/constants', () => ({
	DEFAULT_GENERATOR_CONFIGURATION: {
		separateFileForEachType: {
			type: 'boolean'
		}
	},
	GENERATOR_STORED_OBJECT_NAME: 'test',
	GENERATOR_CONFIGURATION_SCHEMA: {
		separateFileForEachType: {
			type: 'boolean'
		}
	}
}));

describe('ConfigService', () => {
	let getProjectConfigSpy: jest.SpyInstance;

	beforeEach(() => {
		getProjectConfigSpy = jest.spyOn(
			ConfigService as any,
			'getProjectConfig'
		);
	});

	afterEach(() => {
		getProjectConfigSpy.mockRestore();
	});

	describe('getConfigurations', () => {
		it('should get configurations', async () => {
			getProjectConfigSpy.mockResolvedValue({
				get: jest
					.fn()
					.mockReturnValueOnce(DEFAULT_GENERATOR_CONFIGURATION)
			});

			const config = await ConfigService.getConfigurations();

			expect(config).toEqual(DEFAULT_GENERATOR_CONFIGURATION);
			expect(getProjectConfigSpy).toHaveBeenCalled();
		});

		it('should return default configuration if no configuration exists', async () => {
			getProjectConfigSpy.mockResolvedValue({
				get: jest.fn().mockReturnValueOnce(null)
			});

			const config = await ConfigService.getConfigurations();

			expect(config).toEqual(DEFAULT_GENERATOR_CONFIGURATION);
			expect(getProjectConfigSpy).toHaveBeenCalled();
		});
	});

	describe('getSpecificConfiguration', () => {
		let getProjectConfigSpy: jest.SpyInstance;

		beforeEach(async () => {
			getProjectConfigSpy = jest.spyOn(
				ConfigService as any,
				'getProjectConfig'
			);
			getProjectConfigSpy.mockImplementation(() =>
				Promise.resolve({
					separateFileForEachType: true
				})
			);
		});

		afterEach(() => {
			getProjectConfigSpy.mockRestore();
		});

		it('should get a specific configuration', async () => {
			const mockConfig = {
				get: jest.fn().mockReturnValue(true)
			};
			getProjectConfigSpy.mockResolvedValue(mockConfig as any);

			const result = await ConfigService.getSpecificConfiguration(
				separateFileForEachType
			);

			expect(result).toBe(true);
			expect(mockConfig.get).toHaveBeenCalledWith(
				`test.${separateFileForEachType}`
			);
		});
	});

	describe('setConfigurations', () => {
		let getSchemaSpy: jest.SpyInstance;
		let convertValueSpy: jest.SpyInstance;

		beforeEach(async () => {
			getSchemaSpy = jest.spyOn(ConfigService as any, 'getSchema');
			getSchemaSpy.mockReturnValue({
				separateFileForEachType: true
			});
			convertValueSpy = jest.spyOn(ConfigService as any, 'convertValue');
		});

		afterEach(() => {
			getSchemaSpy.mockRestore();
			convertValueSpy.mockRestore();
		});

		it('should set configurations', async () => {
			const mockConfig = {
				set: jest.fn()
			};
			const mockSchema = {
				type: 'boolean'
			};
			getProjectConfigSpy.mockResolvedValue(mockConfig as any);
			getSchemaSpy.mockReturnValue(mockSchema as any);
			convertValueSpy.mockReturnValue(false);

			await ConfigService.setConfigurations({
				separateFileForEachType: false
			});

			expect(mockConfig.set).toHaveBeenCalledWith(
				separateFileForEachType,
				false
			);
		});

		it('should throw an error if the key is invalid', async () => {
			const mockConfig = {
				set: jest.fn()
			};
			getProjectConfigSpy.mockResolvedValue(mockConfig as any);
			getSchemaSpy.mockReturnValue(null);

			await expect(
				ConfigService.setConfigurations({
					invalidKey: 'mockValue'
				} as any)
			).rejects.toThrow(INVALID_CONFIG_KEY_MESSAGE('invalidKey'));
		});

		it('should throw error if get error from convertValue function', async () => {
			const mockConfig = {
				set: jest.fn()
			};
			const mockSchema = {
				type: 'boolean'
			};
			const mockError = new Error(
				INVALID_CONFIG_VALUE_TYPE_MESSAGE(
					separateFileForEachType,
					'boolean'
				)
			);
			convertValueSpy.mockImplementation(() => {
				throw mockError;
			});
			getProjectConfigSpy.mockResolvedValue(mockConfig as any);
			getSchemaSpy.mockReturnValue(mockSchema as any);

			await expect(
				ConfigService.setConfigurations({
					separateFileForEachType: 'invalidValue' as any
				})
			).rejects.toThrow(mockError);
		});

		it('should throw an error if the value type is invalid', async () => {
			const mockConfig = {
				set: jest.fn().mockImplementation(() => {
					throw new Error();
				})
			};
			const mockSchema = { type: 'boolean' };
			getProjectConfigSpy.mockResolvedValue(mockConfig as any);
			getSchemaSpy.mockReturnValue(mockSchema as any);

			await expect(
				ConfigService.setConfigurations({
					separateFileForEachType: 'invalidValue' as any
				})
			).rejects.toThrow(
				INVALID_CONFIG_VALUE_TYPE_MESSAGE(
					separateFileForEachType,
					'boolean'
				)
			);
		});

		it('should throw an error if the converted value type is somehow invalid', async () => {
			const mockConfig = {
				set: jest.fn().mockImplementation(() => {
					throw new Error();
				})
			};
			const mockSchema = {
				type: 'boolean'
			};
			getProjectConfigSpy.mockResolvedValue(mockConfig as any);
			getSchemaSpy.mockReturnValue(mockSchema as any);
			convertValueSpy.mockReturnValue('invalidValue' as any);

			await expect(
				ConfigService.setConfigurations({
					separateFileForEachType: 'true' as any
				})
			).rejects.toThrow(
				INVALID_CONFIG_VALUE_TYPE_MESSAGE(
					separateFileForEachType,
					'boolean'
				)
			);
		});
	});

	describe('initialize', () => {
		it('should initialize configuration', async () => {
			getProjectConfigSpy.mockResolvedValue({
				get: jest.fn().mockReturnValueOnce(null),
				set: jest.fn()
			});

			await ConfigService.initialize();

			expect(getProjectConfigSpy).toHaveBeenCalled();
		});

		it('should not initialize configuration if it already exists', async () => {
			getProjectConfigSpy.mockResolvedValue({
				get: jest
					.fn()
					.mockReturnValueOnce(DEFAULT_GENERATOR_CONFIGURATION),
				set: jest.fn()
			});

			await ConfigService.initialize();

			expect(getProjectConfigSpy).toHaveBeenCalled();
		});
	});

	describe('getProjectConfig', () => {
		it('should get the project config', async () => {
			jest.mock('conf', () => {
				return jest.fn().mockImplementation(() => ({}));
			});

			await (ConfigService as any).getProjectConfig();

			const Conf = require('conf');
			expect(Conf).toHaveBeenCalledWith({
				projectName: GENERATOR_PROJECT_NAME,
				schema: GENERATOR_CONFIGURATION_SCHEMA
			});
		});
	});

	describe('isExpermentalEnumGenerationEnabled', () => {
		it('should return true if experimental enum generation is enabled', async () => {
			const mockConfig = {
				get: jest.fn().mockReturnValueOnce(true)
			};
			getProjectConfigSpy.mockResolvedValue(mockConfig as any);

			const result =
				await ConfigService.isExpermentalEnumGenerationEnabled();

			expect(result).toBe(true);
			expect(getProjectConfigSpy).toHaveBeenCalled();
		});

		it('should return false if experimental enum generation is disabled', async () => {
			const mockConfig = {
				get: jest.fn().mockReturnValueOnce(false)
			};
			getProjectConfigSpy.mockResolvedValue(mockConfig as any);

			const result =
				await ConfigService.isExpermentalEnumGenerationEnabled();

			expect(result).toBe(false);
			expect(getProjectConfigSpy).toHaveBeenCalled();
		});
	});

	describe('convertValue', () => {
		it('should convert a boolean value', () => {
			const result = (ConfigService as any).convertValue(
				separateFileForEachType,
				{ type: 'boolean' },
				'true'
			);

			expect(result).toBe(true);
		});

		it('should convert a string value', () => {
			const result = (ConfigService as any).convertValue(
				'defaultSourceLanguage',
				{ type: 'string', enum: Object.values(Language) },
				'js'
			);

			expect(result).toBe(Language.JavaScript);
		});

		it('should throw error if schema contains enum and value not belongs to that enum', () => {
			const key = 'defaultLanguage';
			const schema = {
				type: 'string',
				enum: Object.values(Language)
			};
			const invalidValue = 'bd';

			expect(() =>
				(ConfigService as any).convertValue(key, schema, invalidValue)
			).toThrow(INVALID_ENUM_CONFIG_VALUE_MESSAGE(key, schema.enum));
		});

		it('should return default value if schema type is other than string or boolean', () => {
			const key = 'newKey';
			const schema = {
				type: 'number'
			};
			const value = 123;

			const result = (ConfigService as any).convertValue(
				key,
				schema,
				value
			);

			expect(result).toBe(value);
		});
	});

	describe('getSchema', () => {
		it('should get the schema for a key', () => {
			const mockSchema = {
				type: 'string'
			};
			GENERATOR_CONFIGURATION_SCHEMA.separateFileForEachType = mockSchema;

			const result = (ConfigService as any).getSchema(
				separateFileForEachType
			);

			expect(result).toBe(mockSchema);
		});
	});
});
