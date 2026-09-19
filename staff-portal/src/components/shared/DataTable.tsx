import {
  type ColumnDef, flexRender, getCoreRowModel,
  getPaginationRowModel, getSortedRowModel, useReactTable,
  type SortingState, type RowSelectionState,
} from '@tanstack/react-table';
import { useState } from 'react';
import { ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { TableSkeleton } from './TableSkeleton';

interface ManualPagination {
  pageIndex: number;
  pageCount: number;
  onPageChange: (pageIndex: number) => void;
}

interface DataTableProps<TData> {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: TData) => void;
  enableSelection?: boolean;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: (selection: RowSelectionState) => void;
  pageSize?: number;
  manualPagination?: ManualPagination;
}

export function DataTable<TData>({
  columns, data, isLoading, emptyMessage = 'No records found.',
  onRowClick, enableSelection, rowSelection, onRowSelectionChange,
  pageSize = 10, manualPagination,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const resolvedColumns: ColumnDef<TData, unknown>[] = enableSelection
    ? [
        {
          id: 'select',
          header: ({ table }) => (
            <Checkbox
              checked={table.getIsAllPageRowsSelected()}
              onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
              aria-label="Select all"
            />
          ),
          cell: ({ row }) => (
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(v) => row.toggleSelected(!!v)}
              onClick={(e) => e.stopPropagation()}
              aria-label="Select row"
            />
          ),
          enableSorting: false,
        },
        ...columns,
      ]
    : columns;

  const table = useReactTable({
    data,
    columns: resolvedColumns,
    state: {
      sorting,
      rowSelection,
      ...(manualPagination && { pagination: { pageIndex: manualPagination.pageIndex, pageSize } }),
    },
    onSortingChange: setSorting,
    onRowSelectionChange: onRowSelectionChange as never,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    ...(!manualPagination && { getPaginationRowModel: getPaginationRowModel() }),
    manualPagination: !!manualPagination,
    pageCount: manualPagination?.pageCount,
    initialState: { pagination: { pageSize } },
    enableRowSelection: enableSelection,
  });

  if (isLoading) return <TableSkeleton columns={columns.length} />;

  const currentPage = manualPagination ? manualPagination.pageIndex : table.getState().pagination.pageIndex;
  const totalPages = manualPagination ? manualPagination.pageCount : table.getPageCount();
  const canPrev = manualPagination ? currentPage > 0 : table.getCanPreviousPage();
  const canNext = manualPagination ? currentPage < totalPages - 1 : table.getCanNextPage();

  const goPrev = () => (manualPagination ? manualPagination.onPageChange(currentPage - 1) : table.previousPage());
  const goNext = () => (manualPagination ? manualPagination.onPageChange(currentPage + 1) : table.nextPage());

  return (
    <div className="space-y-3">
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : header.column.getCanSort() ? (
                      <button
                        type="button"
                        className="flex items-center gap-1 font-medium"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                      </button>
                    ) : (
                      flexRender(header.column.columnDef.header, header.getContext())
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={resolvedColumns.length} className="h-32 text-center text-muted-foreground">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className={onRowClick ? 'cursor-pointer hover:bg-muted/50' : undefined}
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {currentPage + 1} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={goPrev} disabled={!canPrev}>
              <ChevronLeft className="h-4 w-4" /> Previous
            </Button>
            <Button variant="outline" size="sm" onClick={goNext} disabled={!canNext}>
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}