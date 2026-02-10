import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout"
import { Head, router } from "@inertiajs/react"
import { useState } from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Download, Filter, Search } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/Components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card"
import { Input } from "@/Components/ui/input"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/Components/ui/popover"
import { Calendar } from "@/Components/ui/calendar"

declare var route: any;

interface RevenueData {
    date: string
    raw_date: string
    income: number
    expenses: number
    net: number
}

interface Props {
    auth: any
    data: RevenueData[]
    filters: {
        date_from: string
        date_to: string
    }
}

export default function RevenueReport({ auth, data, filters }: Props) {
    const [dateFrom, setDateFrom] = useState<Date | undefined>(
        filters.date_from ? new Date(filters.date_from) : undefined
    )
    const [dateTo, setDateTo] = useState<Date | undefined>(
        filters.date_to ? new Date(filters.date_to) : undefined
    )

    const handleFilter = () => {
        router.get(
            route("reports.revenue"),
            {
                date_from: dateFrom ? format(dateFrom, "yyyy-MM-dd") : "",
                date_to: dateTo ? format(dateTo, "yyyy-MM-dd") : "",
            },
            { preserveState: true }
        )
    }

    const handleExport = (exportFormat: 'pdf' | 'xlsx') => {
        const queryParams = new URLSearchParams({
            date_from: dateFrom ? format(dateFrom, "yyyy-MM-dd") : "",
            date_to: dateTo ? format(dateTo, "yyyy-MM-dd") : "",
            format: exportFormat
        }).toString()

        window.open(route("reports.revenue.export") + "?" + queryParams, '_blank')
    }

    const totalIncome = data.reduce((sum, item) => sum + Number(item.income), 0)
    const totalExpenses = data.reduce((sum, item) => sum + Number(item.expenses), 0)
    const netRevenue = totalIncome - totalExpenses

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Revenue Report</h2>}
            breadcrumbs={[
                { label: 'Dashboard', href: route('dashboard') },
                { label: 'Reports' },
                { label: 'Revenue' },
            ]}
        >
            <Head title="Revenue Report" />

            <div className="py-6 px-4 sm:px-6 lg:px-8 space-y-6">

                {/* Filters */}
                <Card className="no-print">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Filter className="h-5 w-5" /> Filter Options
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col sm:flex-row gap-4 items-end">
                            <div className="space-y-2 flex-1 sm:max-w-xs">
                                <label className="text-sm font-medium">Date From</label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !dateFrom && "text-muted-foreground")}>
                                            {dateFrom ? format(dateFrom, "PPP") : <span>Pick a date</span>}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar mode="single" selected={dateFrom} onSelect={setDateFrom} initialFocus />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div className="space-y-2 flex-1 sm:max-w-xs">
                                <label className="text-sm font-medium">Date To</label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !dateTo && "text-muted-foreground")}>
                                            {dateTo ? format(dateTo, "PPP") : <span>Pick a date</span>}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar mode="single" selected={dateTo} onSelect={setDateTo} initialFocus />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <Button onClick={handleFilter} className="bg-emerald-600 hover:bg-emerald-700">
                                <Search className="w-4 h-4 mr-2" /> Apply Filters
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex justify-between items-center no-print">
                    <h2 className="text-xl font-bold text-gray-800">Financial Summary</h2>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => handleExport('pdf')}>
                            <Download className="w-4 h-4 mr-2" /> PDF
                        </Button>
                        <Button variant="outline" onClick={() => handleExport('xlsx')}>
                            <Download className="w-4 h-4 mr-2" /> Excel
                        </Button>
                    </div>
                </div>

                {/* Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardHeader className="py-4">
                            <CardTitle className="text-sm font-medium text-gray-500">Total Income</CardTitle>
                            <div className="text-2xl font-bold text-emerald-600">₱{totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="py-4">
                            <CardTitle className="text-sm font-medium text-gray-500">Total Expenses</CardTitle>
                            <div className="text-2xl font-bold text-red-600">₱{totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="py-4">
                            <CardTitle className="text-sm font-medium text-gray-500">Net Revenue</CardTitle>
                            <div className={cn("text-2xl font-bold", netRevenue >= 0 ? "text-indigo-600" : "text-red-600")}>
                                ₱{netRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                        </CardHeader>
                    </Card>
                </div>

                <Card>
                    <div className="rounded-md border">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Date</th>
                                    <th className="h-10 px-4 text-right align-middle font-medium text-muted-foreground">Income</th>
                                    <th className="h-10 px-4 text-right align-middle font-medium text-muted-foreground">Expenses</th>
                                    <th className="h-10 px-4 text-right align-middle font-medium text-muted-foreground">Net Revenue</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.length > 0 ? (
                                    data.map((row) => (
                                        <tr key={row.raw_date} className="border-b transition-colors hover:bg-muted/50">
                                            <td className="p-4 align-middle">{row.date}</td>
                                            <td className="p-4 align-middle text-right text-emerald-600">₱{Number(row.income).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                            <td className="p-4 align-middle text-right text-red-600">₱{Number(row.expenses).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                            <td className="p-4 align-middle text-right font-bold">
                                                <span className={Number(row.net) >= 0 ? "text-indigo-600" : "text-red-600"}>
                                                    ₱{Number(row.net).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="p-8 text-center text-gray-500">No data found for the selected date range.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </AuthenticatedLayout>
    )
}
