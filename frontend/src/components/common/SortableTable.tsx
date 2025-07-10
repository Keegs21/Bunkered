import React, { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Paper,
  Box,
  Typography,
  TextField,
  InputAdornment,
  CircularProgress,
  TablePagination,
  Card,
  CardContent,
  Chip,
  useTheme,
  useMediaQuery,
  Stack,
  IconButton,
  Collapse,
  Grid,
  Divider,
  Button,
  Skeleton,
  Alert,
} from "@mui/material";
import {
  Search,
  ExpandMore,
  ExpandLess,
  FilterList,
  ViewList,
  ViewModule,
  SwapVert,
  KeyboardArrowDown,
  KeyboardArrowUp,
} from "@mui/icons-material";

export interface Column {
  id: string;
  label: string;
  minWidth?: number;
  align?: "right" | "left" | "center";
  format?: (value: any, row?: any) => React.ReactNode;
  sortable?: boolean;
  mobileLabel?: string; // Optional shorter label for mobile
  mobileHidden?: boolean; // Hide column on mobile
  mobileFormat?: (value: any, row?: any) => React.ReactNode; // Special mobile formatting
  mobilePriority?: 1 | 2 | 3; // 1 = highest priority (always show), 3 = lowest (hide first)
}

export type SortDirection = "asc" | "desc";

interface SortableTableProps {
  columns: Column[];
  data: any[];
  loading?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  defaultSortColumn?: string;
  defaultSortDirection?: SortDirection;
  title?: string;
  onRowClick?: (row: any) => void;
  pagination?: boolean;
  rowsPerPageOptions?: number[];
  defaultRowsPerPage?: number;
  mobileCardLayout?: boolean; // Force card layout even on desktop
  emptyStateMessage?: string;
  emptyStateIcon?: React.ReactNode;
  enableSorting?: boolean;
  stickyHeader?: boolean;
  maxHeight?: number | string;
}

const SortableTable: React.FC<SortableTableProps> = ({
  columns,
  data,
  loading = false,
  searchable = true,
  searchPlaceholder = "Search...",
  defaultSortColumn,
  defaultSortDirection = "asc",
  title,
  onRowClick,
  pagination = false,
  rowsPerPageOptions = [10, 25, 50],
  defaultRowsPerPage = 25,
  mobileCardLayout = false,
  emptyStateMessage = "No data available",
  emptyStateIcon,
  enableSorting = true,
  stickyHeader = false,
  maxHeight,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [orderBy, setOrderBy] = useState<string>(
    defaultSortColumn || columns[0]?.id || ""
  );
  const [order, setOrder] = useState<SortDirection>(defaultSortDirection);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  // Determine if we should use card layout
  const useCardLayout = mobileCardLayout || isMobile;

  // Handle sort
  const handleSort = (columnId: string) => {
    if (!enableSorting) return;

    const isAsc = orderBy === columnId && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(columnId);
    setPage(0);
  };

  // Handle pagination
  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle row expansion (for mobile cards)
  const toggleRowExpansion = (rowId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(rowId)) {
      newExpanded.delete(rowId);
    } else {
      newExpanded.add(rowId);
    }
    setExpandedRows(newExpanded);
  };

  // Get visible columns for current screen size
  const getVisibleColumns = () => {
    if (!isMobile) return columns;

    // On mobile, prioritize columns based on mobilePriority
    const sortedColumns = [...columns].sort((a, b) => {
      const aPriority = a.mobilePriority || 2;
      const bPriority = b.mobilePriority || 2;
      return aPriority - bPriority;
    });

    // Show primary columns only on small mobile
    if (isSmallMobile) {
      return sortedColumns.filter(
        (col) => !col.mobileHidden && (col.mobilePriority || 2) <= 2
      );
    }

    // Show more columns on regular mobile
    return sortedColumns.filter((col) => !col.mobileHidden);
  };

  const visibleColumns = getVisibleColumns();

  // Filter and sort data
  const processedData = useMemo(() => {
    let filteredData = [...data];

    // Apply search filter
    if (searchQuery && searchable) {
      const query = searchQuery.toLowerCase();
      filteredData = filteredData.filter((row) =>
        Object.values(row).some((value) =>
          String(value).toLowerCase().includes(query)
        )
      );
    }

    // Apply sorting
    if (orderBy && enableSorting) {
      filteredData.sort((a, b) => {
        const aValue = a[orderBy];
        const bValue = b[orderBy];

        // Handle null/undefined values and "N/A" strings
        const aIsEmpty =
          aValue == null || String(aValue).toLowerCase() === "n/a";
        const bIsEmpty =
          bValue == null || String(bValue).toLowerCase() === "n/a";

        if (aIsEmpty && bIsEmpty) return 0;
        if (aIsEmpty) return 1;
        if (bIsEmpty) return -1;

        // Handle numeric values
        if (typeof aValue === "number" && typeof bValue === "number") {
          return order === "asc" ? aValue - bValue : bValue - aValue;
        }

        // Try to parse as numbers
        const aNum = parseFloat(String(aValue));
        const bNum = parseFloat(String(bValue));

        if (!isNaN(aNum) && !isNaN(bNum)) {
          return order === "asc" ? aNum - bNum : bNum - aNum;
        }

        // Handle string values
        const aStr = String(aValue).toLowerCase();
        const bStr = String(bValue).toLowerCase();

        if (aStr < bStr) return order === "asc" ? -1 : 1;
        if (aStr > bStr) return order === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filteredData;
  }, [data, searchQuery, orderBy, order, searchable, enableSorting]);

  // Apply pagination
  const paginatedData = useMemo(() => {
    if (!pagination) return processedData;
    const startIndex = page * rowsPerPage;
    return processedData.slice(startIndex, startIndex + rowsPerPage);
  }, [processedData, page, rowsPerPage, pagination]);

  // Reset page when search changes
  React.useEffect(() => {
    setPage(0);
  }, [searchQuery]);

  // Enhanced Mobile Card Component with better interactions
  const MobileCard: React.FC<{ row: any; index: number }> = ({
    row,
    index,
  }) => {
    const rowId = `row-${index}`;
    const isExpanded = expandedRows.has(rowId);
    const hasHiddenContent = columns.some(
      (col) => col.mobileHidden && row[col.id] != null
    );

    // Get primary columns for card header (first 2 high priority columns)
    const primaryColumns = visibleColumns.slice(0, 2);
    const secondaryColumns = visibleColumns.slice(2);

    return (
      <Card
        sx={{
          mb: 2,
          cursor: onRowClick ? "pointer" : "default",
          transition: "all 0.2s ease",
          "&:hover": onRowClick
            ? {
                boxShadow: theme.shadows[4],
                transform: "translateY(-2px)",
              }
            : {},
          "&:active": onRowClick
            ? {
                transform: "translateY(0px)",
              }
            : {},
        }}
        onClick={() => onRowClick?.(row)}
      >
        <CardContent sx={{ pb: hasHiddenContent ? 2 : "16px !important" }}>
          {/* Primary Info */}
          <Box sx={{ mb: secondaryColumns.length > 0 ? 2 : 0 }}>
            {primaryColumns.map((column, idx) => {
              const value = row[column.id];
              const formattedValue = column.mobileFormat
                ? column.mobileFormat(value, row)
                : column.format
                ? column.format(value, row)
                : value;

              return (
                <Box key={column.id} sx={{ mb: idx === 0 ? 1 : 0 }}>
                  {idx === 0 ? (
                    <Typography
                      variant="h6"
                      component="h3"
                      sx={{
                        fontWeight: 600,
                        fontSize: isSmallMobile ? "1rem" : "1.125rem",
                        lineHeight: 1.3,
                      }}
                    >
                      {formattedValue}
                    </Typography>
                  ) : (
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      sx={{
                        fontSize: isSmallMobile ? "0.875rem" : "1rem",
                      }}
                    >
                      {formattedValue}
                    </Typography>
                  )}
                </Box>
              );
            })}
          </Box>

          {/* Secondary Info Grid */}
          {secondaryColumns.length > 0 && (
            <Grid container spacing={2}>
              {secondaryColumns
                .slice(0, isExpanded ? secondaryColumns.length : 4)
                .map((column) => {
                  const value = row[column.id];
                  if (value == null) return null;

                  const formattedValue = column.mobileFormat
                    ? column.mobileFormat(value, row)
                    : column.format
                    ? column.format(value, row)
                    : value;

                  return (
                    <Grid item xs={6} sm={4} key={column.id}>
                      <Box>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            display: "block",
                            fontSize: isSmallMobile ? "0.6875rem" : "0.75rem",
                            fontWeight: 500,
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                            mb: 0.5,
                          }}
                        >
                          {column.mobileLabel || column.label}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 500,
                            fontSize: isSmallMobile ? "0.8125rem" : "0.875rem",
                          }}
                        >
                          {formattedValue}
                        </Typography>
                      </Box>
                    </Grid>
                  );
                })}
            </Grid>
          )}

          {/* Expand Button */}
          {(hasHiddenContent || secondaryColumns.length > 4) && (
            <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: "divider" }}>
              <Button
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleRowExpansion(rowId);
                }}
                endIcon={
                  isExpanded ? <KeyboardArrowUp /> : <KeyboardArrowDown />
                }
                sx={{
                  fontSize: "0.75rem",
                  minHeight: "32px",
                  color: "text.secondary",
                }}
              >
                {isExpanded ? "Show Less" : "Show More"}
              </Button>
            </Box>
          )}

          {/* Expanded Content */}
          <Collapse in={isExpanded}>
            <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: "divider" }}>
              <Grid container spacing={2}>
                {columns
                  .filter((col) => col.mobileHidden && row[col.id] != null)
                  .map((column) => {
                    const value = row[column.id];
                    const formattedValue = column.format
                      ? column.format(value, row)
                      : value;

                    return (
                      <Grid item xs={6} sm={4} key={column.id}>
                        <Box>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              display: "block",
                              fontSize: "0.6875rem",
                              fontWeight: 500,
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                              mb: 0.5,
                            }}
                          >
                            {column.label}
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {formattedValue}
                          </Typography>
                        </Box>
                      </Grid>
                    );
                  })}
              </Grid>
            </Box>
          </Collapse>
        </CardContent>
      </Card>
    );
  };

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <Box>
      {useCardLayout ? (
        <Stack spacing={2}>
          {Array.from({ length: 5 }).map((_, index) => (
            <Card key={index}>
              <CardContent>
                <Skeleton
                  variant="text"
                  height={28}
                  width="60%"
                  sx={{ mb: 1 }}
                />
                <Skeleton
                  variant="text"
                  height={20}
                  width="40%"
                  sx={{ mb: 2 }}
                />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Skeleton variant="text" height={16} width="50%" />
                    <Skeleton variant="text" height={20} width="80%" />
                  </Grid>
                  <Grid item xs={6}>
                    <Skeleton variant="text" height={16} width="50%" />
                    <Skeleton variant="text" height={20} width="80%" />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ))}
        </Stack>
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {visibleColumns.map((column) => (
                  <TableCell key={column.id}>
                    <Skeleton variant="text" height={20} />
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.from({ length: 10 }).map((_, index) => (
                <TableRow key={index}>
                  {visibleColumns.map((column) => (
                    <TableCell key={column.id}>
                      <Skeleton variant="text" height={20} />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );

  // Empty state component
  const EmptyState = () => (
    <Box
      sx={{
        textAlign: "center",
        py: 8,
        px: 2,
      }}
    >
      {emptyStateIcon && (
        <Box sx={{ mb: 2, color: "text.secondary" }}>{emptyStateIcon}</Box>
      )}
      <Typography variant="h6" color="text.secondary" gutterBottom>
        {emptyStateMessage}
      </Typography>
      {searchQuery && (
        <Typography variant="body2" color="text.secondary">
          Try adjusting your search criteria
        </Typography>
      )}
    </Box>
  );

  // Header with search and view controls
  const TableHeader = () => (
    <Box sx={{ mb: 3 }}>
      {title && (
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
      )}

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        alignItems={{ xs: "stretch", sm: "center" }}
        justifyContent="space-between"
      >
        {/* Search */}
        {searchable && (
          <TextField
            size="small"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: "text.secondary" }} />
                </InputAdornment>
              ),
            }}
            sx={{
              minWidth: { xs: "100%", sm: 300 },
              maxWidth: { xs: "100%", sm: 400 },
            }}
          />
        )}

        {/* View Toggle for larger screens */}
        {!isMobile && !mobileCardLayout && (
          <Stack direction="row" spacing={1}>
            <IconButton
              size="small"
              onClick={() => setViewMode("table")}
              color={viewMode === "table" ? "primary" : "default"}
            >
              <ViewList />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => setViewMode("cards")}
              color={viewMode === "cards" ? "primary" : "default"}
            >
              <ViewModule />
            </IconButton>
          </Stack>
        )}
      </Stack>
    </Box>
  );

  return (
    <Box>
      <TableHeader />

      {loading ? (
        <LoadingSkeleton />
      ) : processedData.length === 0 ? (
        <EmptyState />
      ) : useCardLayout || viewMode === "cards" ? (
        // Mobile Card Layout
        <Box>
          {paginatedData.map((row, index) => (
            <MobileCard key={index} row={row} index={index} />
          ))}
        </Box>
      ) : (
        // Desktop Table Layout
        <TableContainer
          component={Paper}
          sx={{
            maxHeight: maxHeight,
            overflow: "auto",
          }}
        >
          <Table stickyHeader={stickyHeader}>
            <TableHead>
              <TableRow>
                {visibleColumns.map((column) => (
                  <TableCell
                    key={column.id}
                    align={column.align}
                    style={{ minWidth: column.minWidth }}
                    sortDirection={orderBy === column.id ? order : false}
                  >
                    {enableSorting && column.sortable !== false ? (
                      <TableSortLabel
                        active={orderBy === column.id}
                        direction={orderBy === column.id ? order : "asc"}
                        onClick={() => handleSort(column.id)}
                        sx={{
                          "& .MuiTableSortLabel-icon": {
                            fontSize: "1rem",
                          },
                        }}
                      >
                        {column.label}
                      </TableSortLabel>
                    ) : (
                      column.label
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData.map((row, index) => (
                <TableRow
                  hover={!!onRowClick}
                  key={index}
                  onClick={() => onRowClick?.(row)}
                  sx={{
                    cursor: onRowClick ? "pointer" : "default",
                    "&:hover": onRowClick
                      ? {
                          backgroundColor: "action.hover",
                        }
                      : {},
                  }}
                >
                  {visibleColumns.map((column) => {
                    const value = row[column.id];
                    const formattedValue = column.format
                      ? column.format(value, row)
                      : value;

                    return (
                      <TableCell key={column.id} align={column.align}>
                        {formattedValue}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Pagination */}
      {pagination && processedData.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <TablePagination
            rowsPerPageOptions={rowsPerPageOptions}
            component="div"
            count={processedData.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage={isMobile ? "Rows:" : "Rows per page:"}
            sx={{
              "& .MuiTablePagination-toolbar": {
                paddingLeft: { xs: 1, sm: 2 },
                paddingRight: { xs: 1, sm: 2 },
              },
              "& .MuiTablePagination-selectLabel": {
                fontSize: { xs: "0.875rem", sm: "1rem" },
              },
              "& .MuiTablePagination-displayedRows": {
                fontSize: { xs: "0.875rem", sm: "1rem" },
              },
            }}
          />
        </Box>
      )}
    </Box>
  );
};

export default SortableTable;
