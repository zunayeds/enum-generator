import { StringHelper } from '../../utilities';

export const EXPERIMENTAL_ENUM_GENERATION_FORMAT_MESSAGE = (
	fileNames: string[]
) =>
	`Experimentally generated enum(s): ${StringHelper.convertToCommaSeparatedString(fileNames)}`;
