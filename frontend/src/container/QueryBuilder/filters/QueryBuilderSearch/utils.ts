import { OPERATORS } from 'constants/queryBuilder';
import * as Papa from 'papaparse';

const TAG_FSM = /(\w+(?:\.\w+)*)\s*(!=|=|<|<=|>|>=|IN|NOT_IN|LIKE|NOT_LIKE|EXISTS|NOT_EXISTS|CONTAINS|NOT_CONTAINS)\s*([\s\S]*)/g;

export function isValueHaveInNotInOperator(value: string): boolean {
	return value?.includes(OPERATORS.IN || OPERATORS.NIN);
}

export function isExistsNotExistsOperator(value: string): boolean {
	return value?.includes(OPERATORS.EXISTS || OPERATORS.NOT_EXISTS);
}

export function checkCommaAndSpace(value: string): boolean {
	return value.endsWith(',') || value.endsWith(' ');
}

export function isInNInOperator(value: string): boolean {
	return value === OPERATORS.IN || value === OPERATORS.NIN;
}

export function createTagValues(tagValue: string[]): string[] {
	const joinValue = tagValue.join(' ');
	const splitValue = joinValue.endsWith(', ')
		? joinValue.split(', ')
		: joinValue.split(',');
	return splitValue
		.filter(Boolean)
		.map((tag) => (tag.endsWith(',') ? tag.slice(0, -1).trim() : tag.trim()));
}

interface ITagToken {
	tagKey: string;
	tagOperator: string;
	tagValue: string[];
}

export function getTagToken(tag: string): ITagToken {
	// start
	const matches = tag?.matchAll(TAG_FSM);
	const [match] = matches ? Array.from(matches) : [];
	if (match) {
		const [, matchTagKey, matchTagOperator, matchTagValue] = match;
		const toReturn = {
			tagKey: matchTagKey,
			tagOperator: matchTagOperator,
			tagValue:
				matchTagOperator === OPERATORS.IN || matchTagOperator === OPERATORS.NIN
					? Papa.parse(matchTagValue).data
					: [matchTagValue],
		};
		console.log(toReturn);
	} else {
		// no match, only tagKey is present
		const toReturn = {
			tagKey: tag,
			tagOperator: '',
			tagValue: [],
		};
		console.log(toReturn);
	}
	// end
	const [tagKey, tagOperator, ...tagValue] = tag.split(' ');
	return {
		tagKey,
		tagOperator,
		tagValue,
	};
}

export function getRemovePrefixFromKey(tag: string): string {
	return tag?.replace(/^(tag_|resource_)/, '');
}

export function getOperatorValue(op: string): string {
	switch (op) {
		case 'IN':
			return 'in';
		case 'NOT_IN':
			return 'nin';
		case 'LIKE':
			return 'like';
		case 'NOT_LIKE':
			return 'nlike';
		case 'EXISTS':
			return 'exists';
		case 'NOT_EXISTS':
			return 'nexists';
		case 'CONTAINS':
			return 'contains';
		case 'NOT_CONTAINS':
			return 'ncontains';
		default:
			return op;
	}
}

export function getOperatorFromValue(op: string): string {
	switch (op) {
		case 'in':
			return 'IN';
		case 'nin':
			return 'NOT_IN';
		case 'like':
			return 'LIKE';
		case 'nlike':
			return 'NOT_LIKE';
		case 'exists':
			return 'EXISTS';
		case 'nexists':
			return 'NOT_EXISTS';
		case 'contains':
			return 'CONTAINS';
		case 'ncontains':
			return 'NOT_CONTAINS';
		default:
			return op;
	}
}
