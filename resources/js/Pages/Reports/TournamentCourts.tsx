import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout"
import { Head, router } from "@inertiajs/react"
import { useState, useEffect, useRef } from "react"
import axios from "axios"
import { Filter, Printer, Download, Search, ChevronsUpDown, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/Components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card"
import { Badge } from "@/Components/ui/badge"
import ApplicationLogo from "@/Components/ApplicationLogo"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/Components/ui/popover"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/Components/ui/command"
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/Components/ui/pagination"

interface Booking {
    id: number
    booking_date: string
    tournament_name: string
    customer: string
    user_type: string
    schedule_type: string
    games_count: number
    with_trainer: string
    payment_method: string
    payment_reference: string
    payment_status: string
    total_amount: string
}

interface PaginatedBookings {
    data: Booking[]
    links: { url: string | null; label: string; active: boolean }[]
    current_page: number
    last_page: number
    from: number
    to: number
    total: number
    per_page: number
}

interface Tournament { id: number; name: string }

interface Props {
    auth: any
    bookings: PaginatedBookings
    tournaments: Tournament[]
    filters: any
    stats: { total_count: number; total_paid: number; total_unpaid: number }
}

export default function TournamentCourts({ bookings, tournaments, filters, stats }: Props) {
    const [tournamentId, setTournamentId] = useState(filters.tournament_id || "all")
    const [tournamentOpen, setTournamentOpen] = useState(false)
    const [userSearch, setUserSearch] = useState(filters.user_search || "")
    const [customerOpen, setCustomerOpen] = useState(false)
    const [customerSuggestions, setCustomerSuggestions] = useState<string[]>([])
    const [customerQuery, setCustomerQuery] = useState(filters.user_search || "")
    const customerDebounce = useRef<ReturnType<typeof setTimeout> | null>(null)
    const [paymentMethod, setPaymentMethod] = useState(filters.payment_method || "all")
    const [paymentStatus, setPaymentStatus] = useState(filters.payment_status || "all")
    const [printData, setPrintData] = useState<Booking[]>([])
    const [isPrinting, setIsPrinting] = useState(false)

    const top5Tournaments = tournaments.slice(0, 5)
    const selectedTournamentName = top5Tournaments.find(t => String(t.id) === tournamentId)?.name

    const fetchCustomers = (q: string) => {
        axios.get(route("api.tournament-court-bookings.customers"), { params: { search: q } })
            .then(res => setCustomerSuggestions(res.data))
    }

    useEffect(() => {
        fetchCustomers("")
    }, [])

    const handleCustomerQuery = (q: string) => {
        setCustomerQuery(q)
        if (customerDebounce.current) clearTimeout(customerDebounce.current)
        customerDebounce.current = setTimeout(() => fetchCustomers(q), 300)
    }

    useEffect(() => {
        if (isPrinting) document.body.classList.add("printing")
        else document.body.classList.remove("printing")
    }, [isPrinting])

    const handleFilter = () => {
        router.get(route("reports.tournament-courts"), {
            tournament_id: tournamentId,
            user_search: userSearch,
            payment_method: paymentMethod,
            payment_status: paymentStatus,
        }, { preserveState: true })
    }

    const handleReset = () => {
        setTournamentId("all")
        setUserSearch("")
        setCustomerQuery("")
        setPaymentMethod("all")
        setPaymentStatus("all")
        router.visit(route("reports.tournament-courts"))
    }

    const handleExport = (format: "pdf" | "xlsx") => {
        const params = new URLSearchParams({
            tournament_id: tournamentId,
            user_search: userSearch,
            payment_method: paymentMethod,
            payment_status: paymentStatus,
            format,
        }).toString()
        window.open(route("reports.tournament-courts.export") + "?" + params, "_blank")
    }

    const handlePrint = async () => {
        setIsPrinting(true)
        try {
            const res = await axios.get(route("reports.tournament-courts.export"), {
                params: { tournament_id: tournamentId, user_search: userSearch, payment_method: paymentMethod, payment_status: paymentStatus, format: "json" }
            })
            setPrintData(res.data)
            setTimeout(() => { window.print(); setIsPrinting(false) }, 400)
        } catch {
            setIsPrinting(false)
        }
    }

    const statusColor = (s: string) => {
        if (s === "Paid") return "bg-green-100 text-green-800"
        if (s === "Pending") return "bg-orange-100 text-orange-800"
        return "bg-red-100 text-red-800"
    }

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Tournament Court Bookings Report</h2>}
            breadcrumbs={[
                { label: "Dashboard", href: route("dashboard") },
                { label: "Reports" },
                { label: "Tournament Court Bookings" },
            ]}
        >
            <Head title="Tournament Court Bookings Report" />

            <style>{`
                @media print {
                    @page { size: landscape; margin: 5mm; }
                    body, body * { visibility: hidden; height: 0; }
                    #print-view, #print-view * { visibility: visible; height: auto; }
                    #print-view { position: absolute; left: 0; top: 0; width: 100vw; margin: 0; padding: 20px; background: white; z-index: 9999; }
                    #main-view { display: none !important; }
                    table { font-size: 10pt; width: 100% !important; border-collapse: collapse !important; }
                    thead { display: table-header-group; }
                    tr { break-inside: avoid; }
                    th, td { padding: 5px !important; border: 1px solid #000 !important; color: #000 !important; text-align: left; }
                    th { background-color: #f0f0f0 !important; font-weight: bold !important; }
                }
            `}</style>

            {/* Main View */}
            <div id="main-view" className={cn("py-6 px-4 sm:px-6 lg:px-8 space-y-6", isPrinting ? "hidden" : "block")}>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card>
                        <CardHeader className="pb-1"><CardTitle className="text-sm text-muted-foreground">Total Bookings</CardTitle></CardHeader>
                        <CardContent><p className="text-2xl font-bold">{stats.total_count}</p></CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-1"><CardTitle className="text-sm text-muted-foreground">Total Paid</CardTitle></CardHeader>
                        <CardContent><p className="text-2xl font-bold text-emerald-600">₱{Number(stats.total_paid).toLocaleString("en-PH", { minimumFractionDigits: 2 })}</p></CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-1"><CardTitle className="text-sm text-muted-foreground">Total Unpaid</CardTitle></CardHeader>
                        <CardContent><p className="text-2xl font-bold text-orange-500">₱{Number(stats.total_unpaid).toLocaleString("en-PH", { minimumFractionDigits: 2 })}</p></CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Filter className="h-5 w-5" /> Filter Options
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Tournament Combobox */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Tournament</label>
                                <Popover open={tournamentOpen} onOpenChange={setTournamentOpen}>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" role="combobox" className="w-full justify-between font-normal">
                                            <span className="truncate">{selectedTournamentName ?? "All Tournaments"}</span>
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="p-0" style={{ width: 'var(--radix-popover-trigger-width)' }} align="start">
                                        <Command>
                                            <CommandInput placeholder="Search tournament..." />
                                            <CommandList>
                                                <CommandEmpty>No tournament found.</CommandEmpty>
                                                <CommandGroup>
                                                    <CommandItem value="all" onSelect={() => { setTournamentId("all"); setTournamentOpen(false) }} className={cn(tournamentId === "all" && "bg-green-500 text-white")}>
                                                        <Check className={cn("mr-2 h-4 w-4", tournamentId === "all" ? "opacity-100" : "opacity-0")} />
                                                        All Tournaments
                                                    </CommandItem>
                                                    {top5Tournaments.map(t => (
                                                        <CommandItem key={t.id} value={t.name} onSelect={() => { setTournamentId(String(t.id)); setTournamentOpen(false) }} className={cn(tournamentId === String(t.id) && "bg-green-500 text-white")}>
                                                            <Check className={cn("mr-2 h-4 w-4", tournamentId === String(t.id) ? "opacity-100" : "opacity-0")} />
                                                            {t.name}
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>

                            {/* Customer Combobox */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Customer</label>
                                <Popover open={customerOpen} onOpenChange={setCustomerOpen}>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" role="combobox" className="w-full justify-between font-normal">
                                            <span className="truncate">{userSearch || "Search customer..."}</span>
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="p-0" style={{ width: 'var(--radix-popover-trigger-width)' }} align="start">
                                        <Command shouldFilter={false}>
                                            <CommandInput
                                                placeholder="Type to search..."
                                                value={customerQuery}
                                                onValueChange={handleCustomerQuery}
                                            />
                                            <CommandList>
                                                <CommandEmpty>No customer found.</CommandEmpty>
                                                <CommandGroup>
                                                    {customerSuggestions.map(name => (
                                                        <CommandItem key={name} value={name} onSelect={() => { setUserSearch(name); setCustomerQuery(name); setCustomerOpen(false) }} className={cn(userSearch === name && "bg-green-500 text-white")}>
                                                            <Check className={cn("mr-2 h-4 w-4", userSearch === name ? "opacity-100" : "opacity-0")} />
                                                            {name}
                                                        </CommandItem>
                                                    ))}
                                                    {userSearch && (
                                                        <CommandItem value={"__clear"} onSelect={() => { setUserSearch(""); setCustomerQuery(""); fetchCustomers(""); setCustomerOpen(false) }}>
                                                            Clear selection
                                                        </CommandItem>
                                                    )}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Payment Method</label>
                                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                                    <SelectTrigger className="w-full"><SelectValue placeholder="All Methods" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Methods</SelectItem>
                                        <SelectItem value="cash">Cash</SelectItem>
                                        <SelectItem value="gcash">GCash</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Payment Status</label>
                                <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                                    <SelectTrigger className="w-full"><SelectValue placeholder="All Statuses" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Statuses</SelectItem>
                                        <SelectItem value="paid">Paid</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 mt-4">
                            <Button variant="outline" onClick={handleReset}>Reset</Button>
                            <Button onClick={handleFilter} className="bg-emerald-600 hover:bg-emerald-700">
                                <Search className="w-4 h-4 mr-2" /> Apply Filters
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Actions + Table */}
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-bold text-gray-800">Results ({bookings.total})</h2>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handlePrint}><Printer className="w-4 h-4 mr-2" /> Print</Button>
                        <Button variant="outline" onClick={() => handleExport("pdf")}><Download className="w-4 h-4 mr-2" /> PDF</Button>
                        <Button variant="outline" onClick={() => handleExport("xlsx")}><Download className="w-4 h-4 mr-2" /> Excel</Button>
                    </div>
                </div>

                <Card>
                    <div className="rounded-md border overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="h-10 px-4 text-left font-medium text-muted-foreground">Date</th>
                                    <th className="h-10 px-4 text-left font-medium text-muted-foreground">Tournament</th>
                                    <th className="h-10 px-4 text-left font-medium text-muted-foreground">Customer</th>
                                    <th className="h-10 px-4 text-left font-medium text-muted-foreground">Type</th>
                                    <th className="h-10 px-4 text-center font-medium text-muted-foreground">Slot</th>
                                    <th className="h-10 px-4 text-center font-medium text-muted-foreground">Games</th>
                                    <th className="h-10 px-4 text-center font-medium text-muted-foreground">Trainer</th>
                                    <th className="h-10 px-4 text-center font-medium text-muted-foreground">Method</th>
                                    <th className="h-10 px-4 text-left font-medium text-muted-foreground">Reference</th>
                                    <th className="h-10 px-4 text-center font-medium text-muted-foreground">Status</th>
                                    <th className="h-10 px-4 text-right font-medium text-muted-foreground">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookings.data.length > 0 ? bookings.data.map(b => (
                                    <tr key={b.id} className="border-b hover:bg-muted/50">
                                        <td className="p-4">{b.booking_date}</td>
                                        <td className="p-4">{b.tournament_name}</td>
                                        <td className="p-4 font-medium">{b.customer}</td>
                                        <td className="p-4 capitalize">{b.user_type}</td>
                                        <td className="p-4 text-center">{b.schedule_type}</td>
                                        <td className="p-4 text-center">{b.games_count}</td>
                                        <td className="p-4 text-center">{b.with_trainer}</td>
                                        <td className="p-4 text-center">{b.payment_method}</td>
                                        <td className="p-4 font-mono text-xs">{b.payment_reference}</td>
                                        <td className="p-4 text-center">
                                            <Badge variant="outline" className={cn("capitalize", statusColor(b.payment_status))}>
                                                {b.payment_status}
                                            </Badge>
                                        </td>
                                        <td className="p-4 text-right font-semibold text-emerald-600">₱{b.total_amount}</td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={11} className="p-8 text-center text-muted-foreground">No bookings found for the selected criteria.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {bookings.last_page > 1 && (
                        <div className="flex items-center justify-between p-4 border-t">
                            <p className="text-sm text-gray-600">
                                Showing {(bookings.current_page - 1) * bookings.per_page + 1} to{" "}
                                {Math.min(bookings.current_page * bookings.per_page, bookings.total)} of {bookings.total}
                            </p>
                            <Pagination className="w-auto mx-0">
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            href={bookings.links[0].url || "#"}
                                            className={!bookings.links[0].url ? "pointer-events-none opacity-50" : ""}
                                        />
                                    </PaginationItem>
                                    {bookings.links.slice(1, -1).map((link, i) =>
                                        link.label === "..." ? (
                                            <PaginationItem key={i}><PaginationEllipsis /></PaginationItem>
                                        ) : (
                                            <PaginationItem key={i}>
                                                <PaginationLink href={link.url || "#"} isActive={link.active}>
                                                    <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                                </PaginationLink>
                                            </PaginationItem>
                                        )
                                    )}
                                    <PaginationItem>
                                        <PaginationNext
                                            href={bookings.links[bookings.links.length - 1].url || "#"}
                                            className={!bookings.links[bookings.links.length - 1].url ? "pointer-events-none opacity-50" : ""}
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>
                    )}
                </Card>
            </div>

            {/* Print View */}
            <div id="print-view" className="hidden print:block p-8">
                <div className="flex flex-col items-center justify-center mb-6 gap-1">
                    <ApplicationLogo className="h-20 w-20 fill-current text-gray-800" />
                    <h1 className="text-2xl font-bold">Tuguegarao Tennis Club</h1>
                    <h2 className="text-lg text-gray-600">Tournament Court Bookings Report</h2>
                </div>
                <div className="border border-black">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-100 border-b border-black">
                            <tr>
                                {["Date","Tournament","Customer","Type","Slot","Games","Trainer","Method","Reference","Status","Amount"].map(h => (
                                    <th key={h} className="p-2 border-r border-black text-left font-bold text-black last:border-r-0">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {printData.map(b => (
                                <tr key={b.id} className="border-b border-black">
                                    <td className="p-2 border-r border-black text-black">{b.booking_date}</td>
                                    <td className="p-2 border-r border-black text-black">{b.tournament_name}</td>
                                    <td className="p-2 border-r border-black text-black font-semibold">{b.customer}</td>
                                    <td className="p-2 border-r border-black text-black capitalize">{b.user_type}</td>
                                    <td className="p-2 border-r border-black text-black">{b.schedule_type}</td>
                                    <td className="p-2 border-r border-black text-black text-center">{b.games_count}</td>
                                    <td className="p-2 border-r border-black text-black text-center">{b.with_trainer}</td>
                                    <td className="p-2 border-r border-black text-black">{b.payment_method}</td>
                                    <td className="p-2 border-r border-black text-black text-xs">{b.payment_reference}</td>
                                    <td className="p-2 border-r border-black text-black capitalize">{b.payment_status}</td>
                                    <td className="p-2 text-black text-right">₱{b.total_amount}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="mt-4 text-right font-bold text-sm">Total Records: {printData.length}</div>
            </div>
        </AuthenticatedLayout>
    )
}
