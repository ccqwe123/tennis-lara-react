import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout"
import { Head, router } from "@inertiajs/react"
import { format } from "date-fns"
import { FileDown, Printer } from "lucide-react"

import { Button } from "@/Components/ui/button"
import { Card } from "@/Components/ui/card"
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/Components/ui/pagination"

declare var route: any;

interface GroupedIncome {
    source_type: string
    label: string
    count: number
    total: number
}

interface DailyIncomeSummary {
    date: string
    count: number
    total: number
}

interface PaginatedDailyIncomes {
    data: DailyIncomeSummary[]
    links: { url: string | null; label: string; active: boolean }[]
    current_page: number
    last_page: number
    from: number
    to: number
    total: number
    per_page: number
}

interface Props {
    auth: any
    mode: 'summary' | 'detail'
    grouped?: GroupedIncome[]
    dailyIncomes?: PaginatedDailyIncomes
    date?: string
    total?: number
}

const sourceColors: Record<string, string> = {
    court_booking:            'bg-blue-100 text-blue-700',
    tournament_registration:  'bg-purple-100 text-purple-700',
    tournament_court_booking: 'bg-orange-100 text-orange-700',
    membership:               'bg-emerald-100 text-emerald-700',
    manual:                   'bg-gray-100 text-gray-600',
}

export default function IncomeIndex({ auth, mode, grouped, dailyIncomes, date, total }: Props) {

    const goToDetail = (dateStr: string) => router.get(route('incomes.index'), { date: dateStr })
    const backToSummary = () => router.get(route('incomes.index'))

    const handlePrint = () => {
        const title = mode === 'summary'
            ? 'Daily Income Summary'
            : `Income for ${date ? format(new Date(date + 'T00:00:00'), 'MMM d, yyyy') : ''}`

        let tableHead = ''
        let tableBody = ''

        if (mode === 'summary' && dailyIncomes) {
            tableHead = `<tr><th>Date</th><th style="text-align:center">Items</th><th style="text-align:right">Total Amount</th></tr>`
            tableBody = dailyIncomes.data.map(s => `<tr>
                <td>${format(new Date(s.date + 'T00:00:00'), 'MMM d, yyyy')}</td>
                <td style="text-align:center">${s.count}</td>
                <td style="text-align:right">₱${Number(s.total).toLocaleString()}</td>
            </tr>`).join('')
        } else if (mode === 'detail' && grouped) {
            tableHead = `<tr><th>Source</th><th style="text-align:center">Count</th><th style="text-align:right">Total Amount</th></tr>`
            tableBody = grouped.map(r => `<tr>
                <td>${r.label}</td>
                <td style="text-align:center">${r.count}</td>
                <td style="text-align:right">₱${Number(r.total).toLocaleString()}</td>
            </tr>`).join('')
            tableBody += `<tr style="font-weight:bold;background:#f9fafb">
                <td colspan="2">Total</td>
                <td style="text-align:right">₱${Number(total).toLocaleString()}</td>
            </tr>`
        }

        const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title>
        <style>body{font-family:Arial,sans-serif;font-size:13px;color:#111;margin:24px}h2{margin-bottom:6px}
        p.subtitle{color:#555;margin-bottom:16px;font-size:12px}table{width:100%;border-collapse:collapse}
        th{background:#f3f4f6;padding:8px 12px;text-align:left;border:1px solid #e5e7eb;font-size:12px}
        td{padding:8px 12px;border:1px solid #e5e7eb}tr:nth-child(even) td{background:#fafafa}</style>
        </head><body><h2>${title}</h2>
        <p class="subtitle">Printed on ${format(new Date(), 'MMM d, yyyy h:mm a')}</p>
        <table><thead>${tableHead}</thead><tbody>${tableBody}</tbody></table></body></html>`

        const iframe = document.createElement('iframe')
        Object.assign(iframe.style, { position: 'fixed', right: '0', bottom: '0', width: '0', height: '0', border: 'none' })
        document.body.appendChild(iframe)
        const doc = iframe.contentWindow?.document
        if (doc) {
            doc.open(); doc.write(html); doc.close()
            setTimeout(() => { iframe.contentWindow?.focus(); iframe.contentWindow?.print(); setTimeout(() => document.body.removeChild(iframe), 1000) }, 300)
        }
    }

    const handleExportCSV = () => {
        let csvRows: string[] = []
        if (mode === 'summary' && dailyIncomes) {
            csvRows.push('Date,Items,Total Amount')
            dailyIncomes.data.forEach(s => csvRows.push(`"${format(new Date(s.date + 'T00:00:00'), 'MMM d, yyyy')}",${s.count},${Number(s.total).toFixed(2)}`))
        } else if (mode === 'detail' && grouped) {
            csvRows.push(`Income for ${date}`)
            csvRows.push('Source,Count,Total Amount')
            grouped.forEach(r => csvRows.push(`"${r.label}",${r.count},${Number(r.total).toFixed(2)}`))
            csvRows.push(`Total,,${Number(total).toFixed(2)}`)
        }
        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.setAttribute('href', url)
        link.setAttribute('download', mode === 'summary' ? `income-summary-${format(new Date(), 'yyyy-MM-dd')}.csv` : `income-${date}.csv`)
        document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(url)
    }

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Incomes</h2>}
            breadcrumbs={[
                { label: 'Dashboard', href: route('dashboard') },
                { label: 'Incomes' },
            ]}
        >
            <Head title="Incomes" />

            <div className="py-6 px-4 sm:px-6 lg:px-8 space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-2">
                        {mode === 'detail' && (
                            <Button variant="outline" onClick={backToSummary}>&larr; Back to Summary</Button>
                        )}
                        <h3 className="text-lg font-medium">
                            {mode === 'summary' ? 'Daily Incomes' : `Incomes for ${format(new Date(date! + 'T00:00:00'), 'MMM d, yyyy')}`}
                        </h3>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={handlePrint}><Printer className="w-4 h-4 mr-2" /> Print</Button>
                        <Button variant="outline" onClick={handleExportCSV}><FileDown className="w-4 h-4 mr-2" /> CSV</Button>
                    </div>
                </div>

                <Card>
                    <div className="rounded-md border">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b">
                                {mode === 'summary' ? (
                                    <tr>
                                        <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Date</th>
                                        <th className="h-10 px-4 text-center align-middle font-medium text-muted-foreground">Items</th>
                                        <th className="h-10 px-4 text-right align-middle font-medium text-muted-foreground">Total Amount</th>
                                        <th className="h-10 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
                                    </tr>
                                ) : (
                                    <tr>
                                        <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Source</th>
                                        <th className="h-10 px-4 text-center align-middle font-medium text-muted-foreground">Count</th>
                                        <th className="h-10 px-4 text-right align-middle font-medium text-muted-foreground">Total Amount</th>
                                    </tr>
                                )}
                            </thead>
                            <tbody>
                                {mode === 'summary' && dailyIncomes ? (
                                    dailyIncomes.data.length > 0 ? (
                                        dailyIncomes.data.map((summary) => (
                                            <tr key={summary.date} className="border-b transition-colors hover:bg-muted/50 cursor-pointer" onClick={() => goToDetail(summary.date)}>
                                                <td className="p-4 align-middle font-medium">{format(new Date(summary.date + 'T00:00:00'), 'MMM d, yyyy')}</td>
                                                <td className="p-4 align-middle text-center">{summary.count}</td>
                                                <td className="p-4 align-middle text-right font-mono text-emerald-600 font-bold">₱{Number(summary.total).toLocaleString()}</td>
                                                <td className="p-4 align-middle text-right">
                                                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); goToDetail(summary.date) }}>View</Button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan={4} className="p-8 text-center text-gray-500">No income recorded yet.</td></tr>
                                    )
                                ) : mode === 'detail' && grouped ? (
                                    grouped.length > 0 ? (
                                        grouped.map((row) => (
                                            <tr key={row.source_type} className="border-b hover:bg-muted/50">
                                                <td className="p-4 align-middle">
                                                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${sourceColors[row.source_type] ?? 'bg-gray-100 text-gray-600'}`}>
                                                        {row.label}
                                                    </span>
                                                </td>
                                                <td className="p-4 align-middle text-center text-muted-foreground">{row.count}</td>
                                                <td className="p-4 align-middle text-right font-mono text-emerald-600 font-bold">₱{Number(row.total).toLocaleString()}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan={3} className="p-8 text-center text-gray-500">No items found for this date.</td></tr>
                                    )
                                ) : null}
                            </tbody>
                            {mode === 'detail' && grouped && grouped.length > 0 && (
                                <tfoot>
                                    <tr className="bg-gray-50 font-bold">
                                        <td className="p-4 align-middle" colSpan={2}>Total</td>
                                        <td className="p-4 align-middle text-right font-mono">₱{Number(total).toLocaleString()}</td>
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    </div>
                    {mode === 'summary' && dailyIncomes && dailyIncomes.last_page > 1 && (
                        <div className="flex items-center justify-between p-4 border-t">
                            <p className="text-sm text-gray-600">
                                Showing {(dailyIncomes.current_page - 1) * dailyIncomes.per_page + 1} to{" "}
                                {Math.min(dailyIncomes.current_page * dailyIncomes.per_page, dailyIncomes.total)} of{" "}
                                {dailyIncomes.total} results
                            </p>
                            <Pagination className="w-auto mx-0">
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious href={dailyIncomes.links[0].url || '#'} isActive={!dailyIncomes.links[0].url} className={!dailyIncomes.links[0].url ? 'pointer-events-none opacity-50' : ''} />
                                    </PaginationItem>
                                    {dailyIncomes.links.slice(1, -1).map((link, i) =>
                                        link.label === '...' ? (
                                            <PaginationItem key={i}><PaginationEllipsis /></PaginationItem>
                                        ) : (
                                            <PaginationItem key={i}>
                                                <PaginationLink href={link.url || '#'} isActive={link.active}>
                                                    <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                                </PaginationLink>
                                            </PaginationItem>
                                        )
                                    )}
                                    <PaginationItem>
                                        <PaginationNext href={dailyIncomes.links[dailyIncomes.links.length - 1].url || '#'} isActive={!dailyIncomes.links[dailyIncomes.links.length - 1].url} className={!dailyIncomes.links[dailyIncomes.links.length - 1].url ? 'pointer-events-none opacity-50' : ''} />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>
                    )}
                </Card>
            </div>
        </AuthenticatedLayout>
    )
}
