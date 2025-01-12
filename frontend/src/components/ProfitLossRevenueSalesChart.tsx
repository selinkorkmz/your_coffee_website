import { CartesianGrid, Line, LineChart, XAxis, YAxis, Legend, Tooltip, ResponsiveContainer, BarChart, ReferenceLine, Bar } from "recharts";
import { DatePicker } from "./ui/datePicker";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getInvoices } from "@/lib/requests";
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
      const { data: profitRevenueData } = useQuery({
        queryKey: [startDate, endDate],
        queryFn: async () => {
            const result = await getInvoices(startDate, endDate)

            return [{
                ["profit/loss"]: result.profit,
                revenue: result.revenue,
            }]
        },
      });

    
      const [showDatePickers, setShowDatePickers] = useState(false)
    

    return (
        <div className="flex gap-20 mt-10 px-8">

            <div className="flex flex-col gap-20">
        <BarChart
          width={500}
          height={300}
          data={profitRevenueData}
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
          <ReferenceLine y={0} stroke="#000" />
          <Bar dataKey="revenue" fill="#8884d8" />
          <Bar dataKey="profit/loss" fill="#82ca9d" />
        </BarChart>
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