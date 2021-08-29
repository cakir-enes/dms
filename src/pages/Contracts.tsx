import React, { useEffect, useMemo, useState } from "react"
import { Button, ButtonGroup, Callout, Card, Checkbox, Classes, Divider, H1, H5, HTMLSelect, HTMLTable, Icon, InputGroup, MenuItem, NumericInput, Tag } from "@blueprintjs/core"
import {
    useTable,
    usePagination,
    useFilters,
    useGlobalFilter,
    useAsyncDebounce,
    useRowSelect,
    useExpanded
} from "react-table";
// A great library for fuzzy filtering/sorting items
import { matchSorter } from "match-sorter";
import 'regenerator-runtime/runtime';
import { ItemRenderer, MultiSelect } from "@blueprintjs/select";


export type ContractType = "corp-prepaid" | "corp-postpaid" | "ind-postpaid"
export type StatusType = "IN_PROGRESS" | "WITH_ERR" | "NO_ERR" | "NEW"

export enum CheckStatus {
    "CHECKED",
    "ERROR",
    "NOTSET"
}



export interface IContractProps {
    data: {
        line: string
        contractID: string,
        fullName: string,
        company: string,
        region: string,
        dealer: string,
        store: string,
        type: string,
        date: Date,
        status: string,
        checks: { contract: string, code: string, status: CheckStatus }[],
    }[],
    checkStatus: (name: string, status: CheckStatus) => void
}

export default function Contracts(props: IContractProps) {

    const cols = useMemo(() => [
        {
            // Make an expander cell
            Header: () => null, // No header
            id: 'expander', // It needs an ID
            Cell: ({ row }) => (
                // Use Cell to render an expander for each row.
                // We can use the getToggleRowExpandedProps prop-getter
                // to build the expander.
                <span {...row.getToggleRowExpandedProps()}>
                    {row.isExpanded ? (<Icon icon="chevron-down" />) : (<Icon icon="chevron-right" />)}
                </span>
            ),
        },
        {
            Header: "Line",
            accessor: "line",
            filter: "fuzzyText"
        },
        {
            Header: "Contract",
            accessor: "contractID",
            filter: "fuzzyText"
        },
        {
            Header: "Date",
            accessor: "date",
            filter: "fuzzyText"
        },
        {
            Header: "Region",
            accessor: "region",
            Filter: SelectColumnFilter,
            filter: "includesSome"
        },
        {
            Header: "Contract Info",
            accessor: "meta"
        },
        // todo custom
        // {
        //     Header: "checks",
        //     accessor: "checks"
        // }
    ], [])

    const data = useMemo(() => props.data.map(d => ({ ...d, meta: `${d.fullName}-${d.company}\n${d.dealer}@${d.store}` })), [props.data])


    const filterTypes = React.useMemo(
        () => ({
            // Add a new fuzzyTextFilterFn filter type.
            fuzzyText: fuzzyTextFilterFn,
            // Or, override the default text filter to use
            // "startWith"
            text: (rows, id, filterValue) => {
                return rows.filter((row) => {
                    const rowValue = row.values[id];
                    return rowValue !== undefined
                        ? String(rowValue)
                            .toLowerCase()
                            .startsWith(String(filterValue).toLowerCase())
                        : true;
                });
            }
        }),
        []
    );

    const defaultColumn = React.useMemo(
        () => ({
            // Let's set up our default Filter UI
            Filter: DefaultColumnFilter
        }),
        []
    );

    //@ts-ignore
    const tableInstance = useTable({ columns: cols, data, defaultColumn, filterTypes, autoResetExpanded: false, autoResetFilters: false }, useFilters, useGlobalFilter, useExpanded, usePagination, useRowSelect, hooks => {
        hooks.visibleColumns.push(cols => ([
            {
                id: 'selection',
                // Make this column a groupByBoundary. This ensures that groupBy columns
                // are placed after it
                groupByBoundary: true,
                // The header can use the table's getToggleAllRowsSelectedProps method
                // to render a checkbox
                Header: (opts) => {
                    return (
                        <div>
                            {/* <Checkbox {...opts.getToggleAllPageRowsSelectedProps()} /> */}
                        </div>
                    )
                },
                // The cell can use the individual row's getToggleRowSelectedProps method
                // to the render a checkbox
                Cell: ({ row }) => {
                    // console.log(row)
                    return (
                        <Checkbox />
                    )
                },
            },
            ...cols
        ]))
    })
    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        page,
        prepareRow,
        selectedFlatRows,
        canPreviousPage,
        canNextPage,
        pageOptions,
        pageCount,
        gotoPage,
        nextPage,
        previousPage,
        setPageSize,
        visibleColumns,
        preGlobalFilteredRows,
        setGlobalFilter,
        state: {
            pageIndex,
            pageSize,
            globalFilter,
            groupBy,
            expanded,
            filters,
            selectedRowIds,
        },
    } = tableInstance


    return <Card>
        <H1>Contracts</H1>
        <HTMLTable className={Classes.HTML_TABLE_STRIPED + " " + Classes.INTERACTIVE} {...getTableProps()}>
            <thead>
                {// Loop over the header rows
                    headerGroups.map(headerGroup => (
                        // Apply the header row props
                        <tr {...headerGroup.getHeaderGroupProps()}>
                            {// Loop over the headers in each row
                                headerGroup.headers.map(column => (
                                    // Apply the header cell props
                                    <th {...column.getHeaderProps()}>
                                        {// Render the header
                                            column.render('Header')}
                                        <div>{column.canFilter ? column.render("Filter") : null}</div>
                                    </th>
                                ))}
                        </tr>
                    ))}
                <tr>
                    <th
                        colSpan={visibleColumns.length}
                        style={{
                            textAlign: "left"
                        }}
                    >
                        {/* <GlobalFilter
                            preGlobalFilteredRows={preGlobalFilteredRows}
                            globalFilter={globalFilter}
                            setGlobalFilter={setGlobalFilter}
                        /> */}
                    </th>
                </tr>
            </thead>
            {/* Apply the table body props */}
            <tbody {...getTableBodyProps()}>
                {// Loop over the table rows
                    // console.log("PAAAGE", page)
                    page.map(row => {
                        // Prepare the row for display
                        prepareRow(row)
                        return (
                            // Apply the row prop
                            <React.Fragment>
                                <tr {...row.getRowProps()} onClick={() => row.toggleRowExpanded()}>
                                    {row.cells.map((cell) => {
                                        return (
                                            <td {...cell.getCellProps()}>{cell.render("Cell")}</td>
                                        );
                                    })}
                                </tr>
                                {row.isExpanded ? (
                                    <tr>
                                        <td colSpan={visibleColumns.length}>
                                            {<Card>
                                                {row.original.checks.map(check => {
                                                    return (
                                                        <div style={{ display: "flex" }}>
                                                            <span className={"w-44 text-base font-bold my-auto"}>{check.name}</span>
                                                            <ButtonGroup>
                                                                <Button intent={check.status == CheckStatus.CHECKED ? "success" : "none"} minimal large icon="tick" onClick={() => props.checkStatus(row.original.contractID, check.code, CheckStatus.CHECKED)} />
                                                                <Divider />
                                                                <Button intent={check.status == CheckStatus.ERROR ? "danger" : "none"} minimal large icon="cross" onClick={() => props.checkStatus(row.original.contractID, check.code, CheckStatus.ERROR)} />
                                                            </ButtonGroup>
                                                        </div>
                                                    )
                                                })}
                                            </Card>}
                                        </td>
                                    </tr>
                                ) : null}
                            </React.Fragment>
                        )
                    })}
            </tbody>
        </HTMLTable >
        <div className="pagination">
            <button onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
                {'<<'}
            </button>{' '}
            <button onClick={() => previousPage()} disabled={!canPreviousPage}>
                {'<'}
            </button>{' '}
            <button onClick={() => nextPage()} disabled={!canNextPage}>
                {'>'}
            </button>{' '}
            <button onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>
                {'>>'}
            </button>{' '}
            <span>
                Page{' '}
                <strong>
                    {pageIndex + 1} of {pageOptions.length}
                </strong>{' '}
            </span>
            <span>
                | Go to page:{' '}
                <NumericInput
                    type="number"
                    defaultValue={pageIndex + 1}
                    onChange={e => {
                        const page = e.target.value ? Number(e.target.value) - 1 : 0
                        gotoPage(page)
                    }}

                />
            </span>{' '}
            <HTMLSelect
                value={pageSize}
                onChange={e => {
                    setPageSize(Number(e.target.value))
                }}
            >
                {[10, 20, 30, 40, 50].map(pageSize => (
                    <option key={pageSize} value={pageSize}>
                        Show {pageSize}
                    </option>
                ))}
            </HTMLSelect>
        </div>
    </Card >
}



// Define a default UI for filtering
function GlobalFilter({
    preGlobalFilteredRows,
    globalFilter,
    setGlobalFilter
}) {
    const count = preGlobalFilteredRows.length;
    const [value, setValue] = React.useState(globalFilter);
    const onChange = useAsyncDebounce((value) => {
        setGlobalFilter(value || undefined);
    }, 200);

    return (
        <span>
            Search:{" "}
            <input
                value={value || ""}
                onChange={(e) => {
                    setValue(e.target.value);
                    onChange(e.target.value);
                }}
                placeholder={`${count} records...`}
                className={Classes.INPUT}
            />
        </span>
    );
}

function escapeRegExpChars(text: string) {
    return text.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}

function highlightText(text: string, query: string) {
    let lastIndex = 0;
    const words = query
        .split(/\s+/)
        .filter(word => word.length > 0)
        .map(escapeRegExpChars);
    if (words.length === 0) {
        return [text];
    }
    const regexp = new RegExp(words.join("|"), "gi");
    const tokens: React.ReactNode[] = [];
    while (true) {
        const match = regexp.exec(text);
        if (!match) {
            break;
        }
        const length = match[0].length;
        const before = text.slice(lastIndex, regexp.lastIndex - length);
        if (before.length > 0) {
            tokens.push(before);
        }
        lastIndex = regexp.lastIndex;
        tokens.push(<strong key={lastIndex}>{match[0]}</strong>);
    }
    const rest = text.slice(lastIndex);
    if (rest.length > 0) {
        tokens.push(rest);
    }
    return tokens;
}
// Define a default UI for filtering
function DefaultColumnFilter({
    column: { filterValue, preFilteredRows, setFilter }
}) {
    const count = preFilteredRows.length;

    return (
        <InputGroup
            leftIcon={"search"}
            value={filterValue || ""}
            onChange={e => setFilter(e.target.value) || undefined}
            placeholder={"Search records"}
            rightElement={<Tag minimal={true}>{count}</Tag>}
        />
    );
}

// This is a custom filter UI for selecting
// a unique option from a list
function SelectColumnFilter({
    column: { filterValue = [], setFilter, preFilteredRows, id }
}) {
    // Calculate the options for filtering
    // using the preFilteredRows
    const options = React.useMemo(() => {
        const options = new Set();
        preFilteredRows.forEach((row) => {
            options.add(row.values[id]);
        });
        return [...options.values()];
    }, [id, preFilteredRows]);

    const handleTagRemove = (_tag: React.ReactNode, index: number) => {
        setFilter(filterValue.filter((v, i) => i !== index))
    };

    const StringMultiSelect = MultiSelect.ofType<string>();
    const renderOpt: ItemRenderer<string> = (opt, { handleClick, modifiers, query }) => {
        if (!modifiers.matchesPredicate) {
            return null;
        }
        const text = opt
        return (
            <MenuItem
                active={modifiers.active}
                disabled={modifiers.disabled}
                // label={film.year.toString()}
                key={opt}
                onClick={handleClick}
                text={highlightText(text, query)}
            />
        );
    };
    // Render a multi-select box

    return (
        <StringMultiSelect
            itemRenderer={renderOpt}
            tagRenderer={t => <Tag minimal>{t}</Tag>}
            items={["KIEV", "LVIV", "URFA", "SAMSUN"].filter(v => !filterValue.includes(v))}
            tagInputProps={{
                tagProps: {
                    className: Classes.DARK,
                    minimal: true,
                },
                onRemove: handleTagRemove,
            }}
            selectedItems={filterValue}
            onItemSelect={e => setFilter(filterValue.includes(e) ? filterValue.filter(v => v !== e) : [...filterValue, e])}

        // onChange={(e) => {
        //     let value = Array.from(e.target.selectedOptions, option => option.value);
        //     console.log(value)
        //     setFilter(value || undefined);
        // }}
        />
    );
}

function fuzzyTextFilterFn(rows, id, filterValue) {
    return matchSorter(rows, filterValue, { keys: [(row) => row.values[id]] });
}

// Let the table remove the filter if the string is empty
fuzzyTextFilterFn.autoRemove = (val) => !val;



function getStatusColor(status) {
    if (status === "NEW") {
        return "white";
    }
    if (status === "IN PROGRESS") {
        return "orange";
    }
    if (status === "NO ERROR") {
        return "green";
    }
    if (status === "WITH ERROR") {
        return "red";
    }
}

