
import { Card, Colors, Elevation, H2, OL } from '@blueprintjs/core';
import React, { useState } from 'react'

export interface IDashboardProps {
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
    }[]
}

import {/* @vite-ignore */ BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Sector} from 'recharts';
import {CheckStatus} from "./Contracts";

const data = Array.from({ length: 12 }).map((v, i) => {
    i += 1
    return ({
        name: "Week " + i,
        new: 100 * i,
        error: 50 * i,
        success: 20 * i,
        inprogress: 30 * i
    })
})

const pieData = [
    { name: 'Group A', value: 400 },
    { name: 'Group B', value: 300 },
    { name: 'Group C', value: 300 },
    { name: 'Group D', value: 200 },
];


const COLORS = ['#6d7b86', '#36b812', '#FFBB28', '#ff4242'];

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
        <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
};


function LatestActivity() {

    return <Card style={{ width: "32rem" }} elevation={Elevation.THREE}>
        <H2>Latest Activity</H2>
        <OL>
            <li className="flex justify-between">
                <span>- Checked Status of Contract</span>
                <span className="text-gray-400 text-sm">@11/11/21 12:24</span>
            </li>
            <li className="flex justify-between">
                <span>- Checked Status of Contract</span>
                <span className="text-gray-400 text-sm">@11/11/21 12:24</span>
            </li>
        </OL>
    </Card>
}

export default function Dashboard(props: IDashboardProps) {

    return <div className="m-14 mt-24">
        <div className="mt-14  flex space-x-4">
            <LatestActivity />
            <Card elevation={Elevation.THREE}>
                <BarChart
                    width={1000}
                    height={300}
                    data={data}
                    margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="new" fill={Colors.VERMILION2} />
                    <Bar dataKey="error" fill={Colors.RED3} />
                    <Bar dataKey="success" fill={Colors.GREEN3} />
                    <Bar dataKey="inprogress" fill={Colors.ORANGE3} />
                </BarChart>

                    <PieChart width={1000} height={550}>
                        <Legend />
                        <Pie
                            data={[
                                { name: 'NEW', value: props.data.filter(d => d.status === "NEW").length },
                                { name: 'NO ERROR', value: props.data.filter(d => d.status === "NO_ERR").length },
                                { name: 'IN PROGRESS', value: props.data.filter(d => d.status === "IN_PROGRESS").length },
                                { name: 'WITH ERROR', value: props.data.filter(d => d.status === "WITH_ERR").length },
                            ]}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={renderCustomizedLabel}
                            outerRadius={150}
                            fill="#8884d8"
                            dataKey="value"
                            label
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                    </PieChart>
            </Card>


        </div>

        {/* <ResponsiveContainer className="max-w-40 max-h-44"> */}

        {/* </ResponsiveContainer> */}
    </div>
}