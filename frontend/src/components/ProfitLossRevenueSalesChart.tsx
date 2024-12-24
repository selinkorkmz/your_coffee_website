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

const now = Date.now()
export default function ProfitLossRevenueSalesChart() {
    const [startDate, setStartDate] = useState<Date>(
        new Date(now - 7 * 24 * 60 * 60 * 1000)
      );
      const [endDate, setEndDate] = useState<Date>(new Date(now));
      const [showDatePickers, setShowDatePickers] = useState(false);
      
    

    return (
        <div className="flex gap-20 mt-10 px-8">

            <div className="flex flex-col gap-20">
              <LineChart width={700} height={400} data={stats} >
                <XAxis dataKey="date" />
                <YAxis />
                <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="profitLoss" stroke="#8884d8" name="Profit/Loss" />
                <Line type="monotone" dataKey="revenue" stroke="#ffc658" name="Revenue" />
            </LineChart>
            <LineChart width={700} height={400} data={stats} >
                <XAxis dataKey="date" />
                <YAxis />
                <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="saleCount" stroke="#82ca9d" name="Sale Count" />
            </LineChart>  
            </div>
            
            

            <div className="w-1/3 flex flex-col gap-4">
                <button
                    onClick={() => setShowDatePickers(!showDatePickers)}
                    className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg"
                >
                    Start Date: {startDate.toLocaleDateString()}<br /> End Date: {endDate.toLocaleDateString()}
                </button>
                {showDatePickers && (
                    <div className="flex flex-col gap-4">
                        <DatePicker
                            selected={startDate}
                            setSelected={(date) => setStartDate(date)}
                        />
                        <DatePicker
                            selected={endDate}
                            setSelected={(date) => setEndDate(date)}
                        />
                    </div>
                )}
            </div>
        </div>

    );
}
