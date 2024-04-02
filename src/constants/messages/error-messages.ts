import { StringHelper } from '../../utilities';
import {
	GENERATE_COMMAND_SOURCE_LANGUAGE_OPTION,
	GENERATE_COMMAND_TARGET_LANGUAGE_OPTION
} from '../commands';

const SOURCE = 'Source';
const TARGET = 'Target';
const PARSER = 'Parser';
const CONVERTER = 'Converter';
const LANGUAGE_REQUIRED_MESSAGE = (option: string, type: string) =>
	`'${option}' option is required when default ${type} language is not set.\nEither set the default ${type} language using 'enum-sync config set default${type}Language <language>' or provide the ${type} language using '${option}' option.`;
const UNSUPPORTED_LANGUAGE_MESSAGE = (type: string) =>
	`${type} language is not valid.`;
const MISSING_ENUM_IMPLEMENTATION_MESSAGE = (engine: string, type: string) =>
	`Enum ${engine} not implemented for the ${type} language.`;

export const INVALID_SOURCE_DIRECTORY_MESSAGE =
	'Source directory is not valid.';
export const SAME_SOURCE_AND_TARGET_DIRECTORY_MESSAGE =
	'Source and Target directories cannot be the same.';
export const SOURCE_LANGUAGE_REQUIRED_MESSAGE = LANGUAGE_REQUIRED_MESSAGE(
	GENERATE_COMMAND_SOURCE_LANGUAGE_OPTION,
	SOURCE.toLowerCase()
);
export const UNSUPPORTED_SOURCE_LANGUAGE_MESSAGE =
	UNSUPPORTED_LANGUAGE_MESSAGE(SOURCE);
export const TARGET_LANGUAGE_REQUIRED_MESSAGE = LANGUAGE_REQUIRED_MESSAGE(
	GENERATE_COMMAND_TARGET_LANGUAGE_OPTION,
	TARGET.toLowerCase()
);
export const UNSUPPORTED_TARGET_LANGUAGE_MESSAGE =
	UNSUPPORTED_LANGUAGE_MESSAGE(TARGET);
export const SAME_SOURCE_AND_TARGET_LANGUAGE_MESSAGE =
	'Source and Target languages cannot be the same.';
export const MISSING_ENUM_PARSER_IMPLEMENTATION_MESSAGE =
	MISSING_ENUM_IMPLEMENTATION_MESSAGE(PARSER, SOURCE.toLowerCase());
export const MISSING_ENUM_CONVERTER_IMPLEMENTATION_MESSAGE =
	MISSING_ENUM_IMPLEMENTATION_MESSAGE(CONVERTER, TARGET.toLowerCase());

export const INVALID_KEY_VALUE_PAIR_FORMAT_MESSAGE = (keyValue: string) =>
	`Invalid key-value pair '${keyValue}'. Expected format is 'key=value'.`;
export const DUPLICATE_KEY_MESSAGE = (key: string) =>
	`Duplicate key '${key}' found.`;
export const INVALID_CONFIG_KEY_MESSAGE = (key: string) =>
	`Configuration key '${key}' is not valid.`;
export const INVALID_CONFIG_VALUE_TYPE_MESSAGE = (key: string, type: string) =>
	`Value of '${key}' must be '${type}'.`;
export const INVALID_ENUM_CONFIG_VALUE_MESSAGE = (
	key: string,
	enumValues: string[]
) => `Invalid value for '${key}'. Expected one of ${enumValues.join(', ')}.`;
export const FILE_GENERATION_FAILED_FORMAT_MESSAGE = (fileNames: string[]) =>
	`Generation failed for file(s): ${StringHelper.convertToCommaSeparatedString(fileNames)}`;
export const INVALID_ENUM_MESSAGE = (fileNames: string[]) =>
	`Invalid Enum(s): ${StringHelper.convertToCommaSeparatedString(fileNames)}`;
export const Unsupported_ENUM_MESSAGE = (fileNames: string[]) =>
	`Unsupported Enum(s): ${StringHelper.convertToCommaSeparatedString(fileNames)}`;
