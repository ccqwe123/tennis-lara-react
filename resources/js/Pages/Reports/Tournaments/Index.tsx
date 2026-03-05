
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout"
import { Head, router, Link } from "@inertiajs/react"
import { useState, useEffect } from "react"
import { format } from "date-fns"

import { Calendar as CalendarIcon, Filter, Printer, Download, Search, Loader2, Users } from "lucide-react"
import axios from "axios"

import { cn } from "@/lib/utils"

declare var route: any;

import { Button } from "@/Components/ui/button"
import ApplicationLogo from "@/Components/ApplicationLogo"
import { Calendar } from "@/Components/ui/calendar"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/Components/ui/card"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/Components/ui/popover"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select"
import { Input } from "@/Components/ui/input"
import { Badge } from "@/Components/ui/badge"
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/Components/ui/pagination"

interface Tournament {
    id: number
    name: string
    start_date: string
    end_date: string
    status: string
    fee: string
    participants_count: number
    max_participants: number
}

interface PaginatedTournaments {
    data: Tournament[]
    links: {
        url: string | null
        label: string
        active: boolean
    }[]
    current_page: number
    last_page: number
    from: number
    to: number
    total: number
    per_page: number
}

interface Props {
    auth: any
    tournaments: PaginatedTournaments
    filters: any
}

export default function TournamentReports({ auth, tournaments, filters }: Props) {
    const [dateFrom, setDateFrom] = useState<Date | undefined>(
        filters.date_from ? new Date(filters.date_from) : undefined
    )
    const [dateTo, setDateTo] = useState<Date | undefined>(
        filters.date_to ? new Date(filters.date_to) : undefined
    )
    const [status, setStatus] = useState(filters.status || "all")
    const [search, setSearch] = useState(filters.search || "")


    const [printData, setPrintData] = useState<any[]>([])
    const [isPrinting, setIsPrinting] = useState(false)

    // Ensure main content is hidden during print if printData is ready
    useEffect(() => {
        if (isPrinting) {
            document.body.classList.add('printing')
        } else {
            document.body.classList.remove('printing')
        }
    }, [isPrinting])

    const handleFilter = () => {
        router.get(
            route("reports.tournaments"),
            {
                date_from: dateFrom ? format(dateFrom, "yyyy-MM-dd") : "",
                date_to: dateTo ? format(dateTo, "yyyy-MM-dd") : "",
                status,
                search,
            },
            { preserveState: true }
        )
    }





    const handleExport = (exportFormat: 'pdf' | 'xlsx') => {
        const queryParams = new URLSearchParams({
            date_from: dateFrom ? format(dateFrom, "yyyy-MM-dd") : "",
            date_to: dateTo ? format(dateTo, "yyyy-MM-dd") : "",
            status,
            search,
            format: exportFormat
        }).toString()

        window.open(route("reports.tournaments.export") + "?" + queryParams, '_blank')
    }

    const handlePrint = async () => {
        setIsPrinting(true)
        try {
            // Fetch all data for printing (JSON format)
            const response = await axios.get(route("reports.tournaments.export"), {
                params: {
                    date_from: dateFrom ? format(dateFrom, "yyyy-MM-dd") : "",
                    date_to: dateTo ? format(dateTo, "yyyy-MM-dd") : "",
                    status,
                    search,
                    format: 'json'
                }
            })

            if (response.data) {
                setPrintData(response.data)
                // Wait for render then print
                setTimeout(() => {
                    window.print()
                    setIsPrinting(false)
                }, 500)
            }
        } catch (error) {
            console.error("Failed to fetch print data", error)
            setIsPrinting(false)
        }
    }

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Tournament Reports</h2>}
            breadcrumbs={[
                { label: 'Dashboard', href: route('dashboard') },
                { label: 'Reports' },
                { label: 'Tournaments' },
            ]}
        >
            <Head title="Tournament Reports" />

            <style>{`
                @media print {
                    @page { size: landscape; margin: 5mm; }
                    
                    /* Hide everything primarily */
                    body, body * {
                        visibility: hidden;
                        height: 0;
                    }

                    /* 
                     * Show ONLY the print view container and its children.
                     */
                    #print-view, #print-view * {
                        visibility: visible;
                        height: auto;
                    }

                    #print-view {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100vw;
                        margin: 0;
                        padding: 20px;
                        background: white;
                        z-index: 9999;
                    }
                    
                    /* Explicitly hide the main view to be safe */
                    #main-view {
                        display: none !important;
                    }

                    /* Table styling for print */
                    table { font-size: 10pt; width: 100% !important; border-collapse: collapse !important; }
                    thead { display: table-header-group; }
                    tr { break-inside: avoid; break-after: auto; }
                    th, td { 
                        padding: 6px !important; 
                        border: 1px solid #000 !important; 
                        color: #000 !important;
                        text-align: left;
                    }
                    th { text-align: center; background-color: #f0f0f0 !important; font-weight: bold !important; }
                    
                    /* Ensure table borders remain */
                    table, th, td {
                        border: 1px solid #000 !important;
                    }
                }
            `}</style>

            {/* Main Content */}
            <div id="main-view" className={cn("py-6 px-4 sm:px-6 lg:px-8 space-y-6 main-content", isPrinting ? "hidden" : "block")}>
                {/* Filters - Non-Printable */}
                <Card className="no-print">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Filter className="h-5 w-5" /> Filter Options
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Search */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Search</label>
                                <div className="relative">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search tournament name..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-8"
                                    />
                                </div>
                            </div>

                            {/* Date From */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">From Date (Start)</label>
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

                            {/* Date To */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">To Date (End)</label>
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

                            {/* Status */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Status</label>
                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="All statuses" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Statuses</SelectItem>
                                        <SelectItem value="upcoming">Upcoming</SelectItem>
                                        <SelectItem value="ongoing">Ongoing</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 mt-4">
                            <Button variant="outline" onClick={() => {
                                setDateFrom(undefined)
                                setDateTo(undefined)
                                setStatus("all")
                                setSearch("")
                                router.visit(route('reports.tournaments'))
                            }}>
                                Reset
                            </Button>
                            <Button onClick={handleFilter} className="bg-emerald-600 hover:bg-emerald-700">
                                <Search className="w-4 h-4 mr-2" /> Apply Filters
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Report Actions */}
                <div className="flex justify-between items-center no-print">
                    <h2 className="text-xl font-bold text-gray-800">Results ({tournaments.total})</h2>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handlePrint}>
                            <Printer className="w-4 h-4 mr-2" /> Print
                        </Button>
                        <Button variant="outline" onClick={() => handleExport('pdf')}>
                            <Download className="w-4 h-4 mr-2" /> PDF
                        </Button>
                        <Button variant="outline" onClick={() => handleExport('xlsx')}>
                            <Download className="w-4 h-4 mr-2" /> Excel
                        </Button>
                    </div>
                </div>

                {/* Data Table */}
                <Card>
                    <div className="rounded-md border">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Tournament Name</th>
                                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Start Date</th>
                                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">End Date</th>
                                    <th className="h-10 px-4 text-center align-middle font-medium text-muted-foreground">Status</th>
                                    <th className="h-10 px-4 text-right align-middle font-medium text-muted-foreground">Registration Fee</th>
                                    <th className="h-10 px-4 text-center align-middle font-medium text-muted-foreground">Participants</th>
                                    <th className="h-10 px-4 text-center align-middle font-medium text-muted-foreground">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tournaments.data.length > 0 ? (
                                    tournaments.data.map((tournament) => (
                                        <tr key={tournament.id} className="border-b transition-colors hover:bg-muted/50">
                                            <td className="p-4 align-middle font-medium">{tournament.name}</td>
                                            <td className="p-4 align-middle">{tournament.start_date}</td>
                                            <td className="p-4 align-middle">{tournament.end_date}</td>
                                            <td className="p-4 align-middle text-center">
                                                <Badge variant="outline" className={cn(
                                                    "capitalize",
                                                    tournament.status === 'completed' && "bg-gray-100 text-gray-800",
                                                    tournament.status === 'ongoing' && "bg-green-100 text-green-800 hover:bg-green-100",
                                                    tournament.status === 'upcoming' && "bg-blue-100 text-blue-800 hover:bg-blue-100",
                                                    tournament.status === 'cancelled' && "bg-red-100 text-red-800 hover:bg-red-100",
                                                )}>
                                                    {tournament.status}
                                                </Badge>
                                            </td>
                                            <td className="p-4 align-middle text-right">₱{tournament.fee}</td>
                                            <td className="p-4 align-middle text-center">
                                                {tournament.participants_count} / {tournament.max_participants}
                                            </td>
                                            <td className="p-4 align-middle text-center">
                                                <Link href={route('reports.tournaments.participants', tournament.id)}>
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                        <span className="sr-only">View participants</span>
                                                        <Users className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="p-4 text-center text-muted-foreground">No tournaments found for the selected criteria.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {tournaments.last_page > 1 && (
                        <div className="flex items-center justify-between p-4 border-t no-print">
                            <p className="text-sm text-gray-600">
                                Showing {(tournaments.current_page - 1) * tournaments.per_page + 1} to{" "}
                                {Math.min(tournaments.current_page * tournaments.per_page, tournaments.total)} of{" "}
                                {tournaments.total} results
                            </p>
                            <Pagination className="w-auto mx-0">
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            href={tournaments.links[0].url || '#'}
                                            isActive={!tournaments.links[0].url}
                                            className={!tournaments.links[0].url ? 'pointer-events-none opacity-50' : ''}
                                        />
                                    </PaginationItem>

                                    {tournaments.links.slice(1, -1).map((link, i) => {
                                        if (link.label === '...') {
                                            return (
                                                <PaginationItem key={i}>
                                                    <PaginationEllipsis />
                                                </PaginationItem>
                                            )
                                        }
                                        return (
                                            <PaginationItem key={i}>
                                                <PaginationLink href={link.url || '#'} isActive={link.active}>
                                                    <span dangerouslySetInnerHTML={{ __html: link.label }}></span>
                                                </PaginationLink>
                                            </PaginationItem>
                                        )
                                    })}

                                    <PaginationItem>
                                        <PaginationNext
                                            href={tournaments.links[tournaments.links.length - 1].url || '#'}
                                            isActive={!tournaments.links[tournaments.links.length - 1].url}
                                            className={!tournaments.links[tournaments.links.length - 1].url ? 'pointer-events-none opacity-50' : ''}
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>
                    )}
                </Card>
            </div>


            {/* Print Only Content */}
            <div id="print-view" className="hidden print:block p-8">
                {/* Print Header */}
                <div className="flex flex-col items-center justify-center mb-8 gap-2">
                    <ApplicationLogo className="h-24 w-24 fill-current text-gray-800" />
                    <h1 className="text-2xl font-bold">Tuguegarao Tennis Club</h1>
                    <h2 className="text-xl text-gray-600">Tournament Report</h2>
                </div>

                {/* Print Table */}
                <div className="border border-black">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-100 border-b border-black">
                            <tr>
                                <th className="p-2 border-r border-black text-left font-bold text-black">Tournament Name</th>
                                <th className="p-2 border-r border-black text-left font-bold text-black">Start Date</th>
                                <th className="p-2 border-r border-black text-left font-bold text-black">End Date</th>
                                <th className="p-2 border-r border-black text-center font-bold text-black">Status</th>
                                <th className="p-2 border-r border-black text-right font-bold text-black">Registration Fee</th>
                                <th className="p-2 text-center font-bold text-black">Participants</th>
                            </tr>
                        </thead>
                        <tbody>
                            {printData.map((tournament) => (
                                <tr key={tournament.id} className="border-b border-black">
                                    <td className="p-2 border-r border-black text-black font-semibold">{tournament.name}</td>
                                    <td className="p-2 border-r border-black text-black">{tournament.start_date}</td>
                                    <td className="p-2 border-r border-black text-black">{tournament.end_date}</td>
                                    <td className="p-2 border-r border-black text-center text-black">{tournament.status}</td>
                                    <td className="p-2 border-r border-black text-right text-black">₱{tournament.fee}</td>
                                    <td className="p-2 text-center text-black">{tournament.participants}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AuthenticatedLayout>
    )
}
