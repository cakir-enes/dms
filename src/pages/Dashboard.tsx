// @ts-nocheck

import { Card, Colors, Elevation, H2, OL } from '@blueprintjs/core';
import React, { useState } from 'react'

export interface IDashboardProps {

}

import {/* @vite-ignore */ BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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
            </Card>
        </div>

        {/* <ResponsiveContainer className="max-w-40 max-h-44"> */}

        {/* </ResponsiveContainer> */}
    </div>
}