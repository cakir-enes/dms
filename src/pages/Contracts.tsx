import React, { useMemo } from "react"
import { Card, Classes, H1, HTMLTable } from "@blueprintjs/core"
import { useTable } from "react-table"

export type ContractType = "corp-prepaid" | "corp-postpaid" | "ind-postpaid"
export type StatusType = "IN_PROGRESS" | "WITH_ERR" | "NO_ERR" | "NEW"

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
    }[]
}



export default function Contracts(props: IContractProps) {

    const cols = useMemo(() => [
        {
            Header: "Line",
            accessor: "line"
        },
        {
            Header: "Contract",
            accessor: "contractID"
        },
        {
            Header: "Date",
            accessor: "date"
        },
        {
            Header: "Region",
            accessor: "region"
        },
        {
            Header: "Contract Info",
            accessor: "meta"
        },
        {
            Header: "checks",
            accessor: "checks"
        }
    ], [])

    const data = useMemo(() => props.data.map(d => ({ ...d, checks: "SC", meta: `${d.fullName}-${d.company}\n${d.dealer}@${d.store}` })), [props.data])

    //@ts-ignore
    const tableInstance = useTable({ columns: cols, data })
    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
    } = tableInstance

    return <Card>
        <H1>Contracts</H1>
        <HTMLTable className={Classes.HTML_TABLE_STRIPED} {...getTableProps()}>
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
                                    </th>
                                ))}
                        </tr>
                    ))}
            </thead>
            {/* Apply the table body props */}
            <tbody {...getTableBodyProps()}>
                {// Loop over the table rows
                    rows.map(row => {
                        // Prepare the row for display
                        prepareRow(row)
                        return (
                            // Apply the row props
                            <tr {...row.getRowProps()}>
                                {// Loop over the rows cells
                                    row.cells.map(cell => {
                                        // Apply the cell props
                                        return (
                                            <td {...cell.getCellProps()}>
                                                {// Render the cell contents
                                                    cell.render('Cell')}
                                            </td>
                                        )
                                    })}
                            </tr>
                        )
                    })}
            </tbody>
        </HTMLTable>
    </Card>
}