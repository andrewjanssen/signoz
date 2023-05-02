import { Select, Spin, Tag, Tooltip } from 'antd';
import { useAutoComplete } from 'hooks/queryBuilder/useAutoComplete';
import React, { useEffect, useMemo } from 'react';
import {
	IBuilderQueryForm,
	TagFilter,
} from 'types/api/queryBuilder/queryBuilderData';
import { DataSource } from 'types/common/queryBuilder';
import { v4 as uuid } from 'uuid';

import { selectStyle } from './config';
import { StyledCheckOutlined, TypographyText } from './style';
import {
	checkCommaAndSpace,
	isExistsNotExistsOperator,
	isInNotInOperator,
} from './utils';

function QueryBuilderSearch({
	query,
	onChange,
}: QueryBuilderSearchProps): JSX.Element {
	const {
		updateTag,
		handleClearTag,
		handleKeyDown,
		handleSearch,
		handleSelect,
		tags,
		options,
		searchValue,
		isMulti,
		isFetching,
		setSearchKey,
	} = useAutoComplete(query);

	const onTagRender = ({
		value,
		closable,
		onClose,
	}: CustomTagProps): React.ReactElement => {
		const isInNin = isInNotInOperator(value);
		const chipValue = checkCommaAndSpace(value)
			? value.substring(0, value.length - 2)
			: value;
		const tagValue = isExistsNotExistsOperator(value) ? value : chipValue;

		const onCloseHandler = (): void => {
			onClose();
			handleSearch('');
			setSearchKey('');
		};

		const tagEditHandler = (value: string): void => {
			updateTag(value);
			handleSearch(value);
		};

		return (
			<Tag closable={closable} onClose={onCloseHandler}>
				<Tooltip title={tagValue}>
					<TypographyText
						ellipsis
						$isInNin={isInNin}
						disabled={!!searchValue}
						$isEnabled={!!searchValue}
						onClick={(): void => tagEditHandler(value)}
					>
						{tagValue}
					</TypographyText>
				</Tooltip>
			</Tag>
		);
	};

	const onChangeHandler = (value: string[]): void => {
		if (!isMulti) handleSearch(value[value.length - 1]);
	};

	const onInputKeyDownHandler = (event: React.KeyboardEvent<Element>): void => {
		if (isMulti || event.key === 'Backspace') handleKeyDown(event);
	};

	const isMatricsDataSource = useMemo(
		() => query.dataSource === DataSource.METRICS,
		[query.dataSource],
	);

	const queryTags = useMemo(() => {
		if (!query.aggregateAttribute.key && isMatricsDataSource) return [];
		return tags;
	}, [isMatricsDataSource, query.aggregateAttribute.key, tags]);

	useEffect(() => {
		const initialTagFilters: TagFilter = { items: [], op: 'AND' };
		initialTagFilters.items = tags.map((tag) => {
			const [tagKey, tagOperator, ...tagValue] = tag.split(' ');
			return {
				id: uuid().slice(0, 8),
				key: tagKey,
				op: tagOperator,
				value: tagValue.map((i) => i.replace(',', '')),
			};
		});
		onChange(initialTagFilters);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [tags]);

	return (
		<Select
			virtual
			showSearch
			tagRender={onTagRender}
			filterOption={false}
			autoClearSearchValue={false}
			mode="multiple"
			placeholder="Search Filter"
			value={queryTags}
			searchValue={searchValue}
			disabled={isMatricsDataSource && !query.aggregateAttribute.key}
			style={selectStyle}
			onSearch={handleSearch}
			onChange={onChangeHandler}
			onSelect={handleSelect}
			onDeselect={handleClearTag}
			onInputKeyDown={onInputKeyDownHandler}
			notFoundContent={
				isFetching || options.length === 0 ? <Spin size="small" /> : null
			}
		>
			{(
				options.filter(
					(item, index) =>
						JSON.stringify(item) !== JSON.stringify(options[index - 1]),
				) || []
			).map((option) => (
				<Select.Option key={option.label} value={option.label}>
					{option.label}
					{option.selected && <StyledCheckOutlined />}
				</Select.Option>
			))}
		</Select>
	);
}

interface QueryBuilderSearchProps {
	query: IBuilderQueryForm;
	onChange: (value: TagFilter) => void;
}

export interface CustomTagProps {
	label: React.ReactNode;
	value: string;
	disabled: boolean;
	onClose: (event?: React.MouseEvent<HTMLElement, MouseEvent>) => void;
	closable: boolean;
}

export default QueryBuilderSearch;
