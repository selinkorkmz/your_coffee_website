import { CartesianGrid, Line, LineChart, XAxis, YAxis, Legend, Tooltip } from "recharts";
import { DatePicker } from "./ui/datePicker";
import { useState } from "react";
const stats = [
        {
            date: '2024-12-20',
            profitLoss: 30000,
            saleCount: 20,
            revenue: 50000,
        },
        {
            date: '2024-12-21',
            profitLoss: -3000,
            saleCount: 2,
            revenue: 5000,
        },
        {
            date: '2024-12-22',
            profitLoss: 10000,
            saleCount: 13,
            revenue: 30000,
        },
        {
            date: '2024-12-23',
            profitLoss: -25000,
            saleCount: 50,
            revenue: 100000,
        },
    ];
    
export default function ProfitLossRevenueSalesChart() {
    const [startDate, setStartDate]= useState<Date>()
    const [endDate, setEndDate]= useState<Date>()

    return (
        <div className="flex flex-col">
            <div className="flex">
                <DatePicker
                    selected={startDate}
                    setSelected={(date)=>setStartDate(date)}
                />
                <DatePicker
                    selected={endDate}
                    setSelected={(date)=>setEndDate(date)}
                />

            </div>
            <LineChart width={500} height={300} data={stats}>
            <XAxis dataKey="date" />
            <YAxis />
            <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="profitLoss" stroke="#8884d8" name="Profit/Loss" />
            <Line type="monotone" dataKey="saleCount" stroke="#82ca9d" name="Sale Count" />
            <Line type="monotone" dataKey="revenue" stroke="#ffc658" name="Revenue" />
            </LineChart>
        </div>
        
    );
}
