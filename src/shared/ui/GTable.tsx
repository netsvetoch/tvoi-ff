import type {
	Column,
	Column_RowSorting,
	ReactTable,
	Row,
	RowData,
	SortDirection,
	TableFeatures,
} from "@tanstack/react-table";

import "./g-table.scss";

interface GTableProps<TFeatures extends TableFeatures, TData extends RowData> {
	className?: string;
	emptyMessage?: string;
	onRowClick?: (row: Row<TFeatures, TData>) => void;
	table: ReactTable<TFeatures, TData>;
}

const SortIndicator = ({ order }: { order: false | SortDirection }) => {
	const modifiers = [
		"g-table__sort-indicator",
		order ? `g-table__sort-indicator_order_${order}` : "g-table__sort-indicator_invisible",
	];

	return (
		<span className={modifiers.join(" ")}>
			<svg fill="currentColor" height="3" viewBox="0 0 6 3" width="6">
				<path d="M0.404698 0C0.223319 0 0.102399 0.0887574 0.0419396 0.230769C-0.0386733 0.372781 0.00163315 0.497041 0.122552 0.60355L2.72232 2.89349C2.80293 2.9645 2.88354 3 3.00446 3C3.10523 3 3.20599 2.9645 3.28661 2.89349L5.88637 0.60355C6.00729 0.497041 6.02745 0.372781 5.96699 0.230769C5.88637 0.0887574 5.76545 0 5.60423 0H0.404698Z" />
			</svg>
		</span>
	);
};

export const GTable = <TFeatures extends TableFeatures, TData extends RowData>({
	className,
	emptyMessage = "Нет данных",
	onRowClick,
	table,
}: GTableProps<TFeatures, TData>) => {
	const rootClassName = ["g-table", className].filter(Boolean).join(" ");
	const rows = table.getRowModel().rows;

	return (
		<div className={rootClassName}>
			<table className="g-table__table g-table__table_width_max">
				<thead className="g-table__head">
					{table.getHeaderGroups().map(headerGroup => (
						<tr className="g-table__row" key={headerGroup.id}>
							{headerGroup.headers.map(header => {
								// Методы сортировки есть в рантайме только при зарегистрированном rowSortingFeature
								const sortingColumn = header.column as Column<TFeatures, TData> &
									Partial<Column_RowSorting<TFeatures, TData>>;
								const toggleSortingHandler = sortingColumn.getCanSort?.()
									? sortingColumn.getToggleSortingHandler?.()
									: undefined;
								const sorted = sortingColumn.getIsSorted?.() ?? false;

								const content =
									header.isPlaceholder || header.column.columnDef.header === "" ? undefined : (
										<table.FlexRender header={header} />
									);

								return (
									<th className="g-table__cell g-table__cell_edge-padding" colSpan={header.colSpan} key={header.id}>
										{toggleSortingHandler ? (
											<span
												className="g-table__sort"
												onClick={event => {
													toggleSortingHandler(event);
												}}
												onKeyDown={event => {
													if (event.key === "Enter" || event.key === " ") {
														event.preventDefault();
														toggleSortingHandler(event);
													}
												}}
												role="button"
												tabIndex={0}
											>
												{content}
												<SortIndicator order={sorted} />
											</span>
										) : (
											content
										)}
									</th>
								);
							})}
						</tr>
					))}
				</thead>
				<tbody className="g-table__body">
					{rows.length === 0 ? (
						<tr className="g-table__row g-table__row_empty">
							<td className="g-table__cell g-table__cell_edge-padding" colSpan={table.getAllLeafColumns().length}>
								{emptyMessage}
							</td>
						</tr>
					) : (
						rows.map(row => (
							<tr
								className={`g-table__row${onRowClick ? " g-table__row_interactive" : ""}`}
								key={row.id}
								onClick={
									onRowClick &&
									(() => {
										onRowClick(row);
									})
								}
							>
								{row.getAllCells().map(cell => (
									<td className="g-table__cell g-table__cell_edge-padding" key={cell.id}>
										<table.FlexRender cell={cell} />
									</td>
								))}
							</tr>
						))
					)}
				</tbody>
			</table>
		</div>
	);
};
