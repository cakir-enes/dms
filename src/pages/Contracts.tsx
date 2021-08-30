import React, {useEffect, useMemo, useRef, useState} from "react"
import { Button, ButtonGroup, Callout, Card, Checkbox, Classes, Divider, H1, H5, HTMLSelect, HTMLTable, Icon, InputGroup, Intent, MenuItem, NumericInput, Tag } from "@blueprintjs/core"
import {
    useTable,
    usePagination,
    useFilters,
    useGlobalFilter,
    useAsyncDebounce,
    useRowSelect,
    useExpanded,
    Column
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
    checkStatus: (contract: string, code: string, status: CheckStatus) => void,
    registerDocs: (contractIDs: number[]) => void
    setByTemplate: (template: any, contractIDs: number[]) => void

}

function mapCheckStatusIntent(status: CheckStatus): Intent {
    switch (status) {
        case CheckStatus.CHECKED:
            return Intent.SUCCESS
        case CheckStatus.ERROR:
            return Intent.DANGER
        case CheckStatus.NOTSET:
            return Intent.NONE
    }
}

export default function Contracts(props: IContractProps) {

    const cols: Column[] = useMemo(() => [
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
            accessor: "meta",
            Cell: ({ value }) => {
                console.log(value.split("\n"))
                return <div>{value.split("\n").map(v => (<><span>{v}</span><br /></>))} </div>
            }
        },
        // todo custom
        {
            Header: "Checks",
            accessor: "checks",
            disableFilters: true,
            Cell: ({ value }) => (<div className="flex space-x-1">
                {value.map(v => <Tag className="border-solid border border-black" intent={mapCheckStatusIntent(v.status)}>{v.code}</Tag>)}
            </div>)
        }
    ], [])

    const data = useMemo(() => props.data.map(d => ({ ...d, meta: `${d.fullName}-${d.company}\n${d.dealer}@${d.store}` })), [props.data])
    const template = useRef(undefined);

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
    const tableInstance = useTable({ columns: cols, data, defaultColumn, filterTypes, autoResetExpanded: false,autoResetSelectedRows: false, autoResetFilters: false }, useFilters, useGlobalFilter, useExpanded, usePagination, useRowSelect, hooks => {
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
                            {/* <div>asdasd</div> */}
                        </div>
                    )
                },


                // The cell can use the individual row's getToggleRowSelectedProps method
                // to the render a checkbox
                Cell: ({ row }) => {
                    // console.log(row)
                    let [color, text] = bgColorAndText(row.original.checks, row.original.status)
                    return (
                        <div className="flex justify-around">
                            <Checkbox className="w-4" {...row.getToggleRowSelectedProps()} />
                            <Tag style={{ background: "fill" }} className={" border-solid border border-black " + color}>
                                {text}
                            </Tag>
                        </div>
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

    let bgColorAndText = (checks: any, status: string) => {
        let atleastOneErr = false
        let allOk = true
        for (const c of checks) {
            switch (c.status) {
                case CheckStatus.ERROR:
                    atleastOneErr = true
                    allOk = false
                    return ["bg-red-600", "WITH ERROR"]
                case CheckStatus.NOTSET:
                    allOk = false
                    break
            }
        }
        if (allOk) {
            return ["bg-green-600", "NO ERROR"]
        }
        if (status === "NEW") {
            return ["", "NEW"]
        }
        if (status === "IN_PROGRESS") {
            return ["bg-yellow-600", "IN PROGRESS"]
        }
        return ""
    }

    return <div className="mt-14">
        <HTMLTable className={Classes.HTML_TABLE_STRIPED + " mx-auto " + Classes.INTERACTIVE} {...getTableProps()}>
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
            <tbody className="h-24" {...getTableBodyProps()}>
                {// Loop over the table rows
                    // console.log("PAAAGE", page)
                    page.map(row => {
                        // Prepare the row for display
                        prepareRow(row)
                        let color = bgColorAndText(row.original.checks, row.original.status)[0]
                        return (
                            // Apply the row prop
                            <React.Fragment>
                                <tr className={color}  {...row.getRowProps()} onClick={() => row.toggleRowExpanded()}>
                                    {row.cells.map((cell) => {
                                        return (
                                            <td {...cell.getCellProps()}>{cell.render("Cell")}</td>
                                        );
                                    })}
                                </tr>
                                {row.isExpanded ? (
                                    <tr className={color}>
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
            <div className="flex w-auto mx-auto mt-4">

                <ButtonGroup>
                    <Button icon="double-chevron-left" onClick={() => gotoPage(0)} disabled={!canPreviousPage} />
                    <Button icon="chevron-left" onClick={() => previousPage()} disabled={!canPreviousPage} />

                    <strong className="w-8 mt-1">
                        {pageIndex + 1} / {pageOptions.length}
                    </strong>

                    <Button icon="chevron-right" onClick={() => nextPage()} disabled={!canNextPage} />
                    <Button icon="double-chevron-right" onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage} />
                    <Button disabled={!rows.filter(r => r.isSelected).some(r => r.original.status === "NEW")} intent="primary" text="Register" onClick={() => {
                        let selected = rows.filter(row => row.isSelected && row.original.status === "NEW").map(row => row.index)
                        props.registerDocs(selected)
                    }} />
                    <Button disabled={!(rows.filter(r => r.isSelected).length === 1)} intent="primary" text="Set As Template" onClick={() => {
                        template.current = rows.filter(r => r.isSelected).[0]
                        console.log(template.current);
                        console.log(template.current === undefined)
                    }} />
                    <Button disabled={!template.current} intent="primary" text="Apply Template" onClick={() => {
                        let selected = rows.filter(row => row.isSelected && row.index !==template.current.index).map(row => row.index)
                        console.log(template.current)
                        console.log(selected)
                        props.setByTemplate(template.current, selected)
                    }} />
                </ButtonGroup>

                {/* <HTMLSelect
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
                </HTMLSelect> */}
            </div>
        </HTMLTable >
    </div>
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
            className="w-40"
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

