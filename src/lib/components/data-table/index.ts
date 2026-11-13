import {
	createSortedRowModel,
	rowSortingFeature,
	tableFeatures,
	type Column,
	type ColumnDef,
	type RowData
} from '@tanstack/svelte-table';
import DataTable from './data-table.svelte';
import DataTableColumnHeader from './data-table-column-header.svelte';

export const dataTableFeatures = tableFeatures({ rowSortingFeature, createSortedRowModel });
export type DataTableFeatures = typeof dataTableFeatures;
export type DataTableColumnDef<TData extends RowData, TValue = unknown> = ColumnDef<
	DataTableFeatures,
	TData,
	TValue
>;
export type DataTableColumn<TData extends RowData, TValue = unknown> = Column<
	DataTableFeatures,
	TData,
	TValue
>;

export { DataTable, DataTableColumnHeader };
export default DataTable;
