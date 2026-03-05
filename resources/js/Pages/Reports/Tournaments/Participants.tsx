
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout"
import { Head, router, Link } from "@inertiajs/react"
import { useState, useEffect } from "react"
import { format } from "date-fns"

import { Filter, Printer, Download, Search, ArrowLeft } from "lucide-react"
import axios from "axios"

import { cn } from "@/lib/utils"

declare var route: any;

import { Button } from "@/Components/ui/button"
import ApplicationLogo from "@/Components/ApplicationLogo"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/Components/ui/card"
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

interface Participant {
    id: number
    name: string
    email: string
    user_type: string
    payment_method: string
    payment_status: string
    amount: string
    registered_at: string
}

interface PaginatedParticipants {
    data: Participant[]
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

interface Tournament {
    id: number
    name: string
    start_date: string
    end_date: string
    status: string
}

interface Props {
    auth: any
    tournament: Tournament
    participants: PaginatedParticipants
    filters: any
}

export default function TournamentParticipants({ auth, tournament, participants, filters }: Props) {
    const [paymentStatus, setPaymentStatus] = useState(filters.payment_status || "all")
    const [paymentMethod, setPaymentMethod] = useState(filters.payment_method || "all")
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
            route("reports.tournaments.participants", tournament.id),
            {
                payment_status: paymentStatus,
                payment_method: paymentMethod,
                search,
            },
            { preserveState: true }
        )
    }



    const handleExport = (exportFormat: 'pdf' | 'xlsx') => {
        const queryParams = new URLSearchParams({
            payment_status: paymentStatus,
            payment_method: paymentMethod,
            search,
            format: exportFormat
        }).toString()

        window.open(route("reports.tournaments.participants.export", tournament.id) + "?" + queryParams, '_blank')
    }

    const handlePrint = async () => {
        setIsPrinting(true)
        try {
            // Fetch all data for printing (JSON format)
            const response = await axios.get(route("reports.tournaments.participants.export", tournament.id), {
                params: {
                    payment_status: paymentStatus,
                    payment_method: paymentMethod,
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
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Tournament Report: {tournament.name}</h2>}
            breadcrumbs={[
                { label: 'Dashboard', href: route('dashboard') },
                { label: 'Reports' },
                { label: 'Tournaments', href: route('reports.tournaments') },
                { label: 'Participants' },
            ]}
        >
            <Head title={`Participants - ${tournament.name}`} />

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
                <div className="mb-4">
                    <Link href={route('reports.tournaments')} className="flex items-center text-sm text-gray-500 hover:text-gray-700">
                        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Tournaments
                    </Link>
                </div>

                {/* Filters - Non-Printable */}
                <Card className="no-print">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Filter className="h-5 w-5" /> Filter Options
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Search */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Search</label>
                                <div className="relative">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search participant name or email..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-8"
                                    />
                                </div>
                            </div>

                            {/* Payment Status */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Payment Status</label>
                                <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="All statuses" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Statuses</SelectItem>
                                        <SelectItem value="paid">Paid</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="failed">Failed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Payment Method */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Payment Method</label>
                                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="All methods" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Methods</SelectItem>
                                        <SelectItem value="cash">Cash</SelectItem>
                                        <SelectItem value="online">Online</SelectItem>
                                        <SelectItem value="card">Card</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 mt-4">
                            <Button variant="outline" onClick={() => {
                                setPaymentStatus("all")
                                setPaymentMethod("all")
                                setSearch("")
                                router.visit(route('reports.tournaments.participants', tournament.id))
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
                    <h2 className="text-xl font-bold text-gray-800">Participants ({participants.total})</h2>
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
                                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Participant Name</th>
                                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Email</th>
                                    <th className="h-10 px-4 text-center align-middle font-medium text-muted-foreground">Type</th>
                                    <th className="h-10 px-4 text-center align-middle font-medium text-muted-foreground">Payment Method</th>
                                    <th className="h-10 px-4 text-center align-middle font-medium text-muted-foreground">Payment Status</th>
                                    <th className="h-10 px-4 text-right align-middle font-medium text-muted-foreground">Amount</th>
                                    <th className="h-10 px-4 text-right align-middle font-medium text-muted-foreground">Registered At</th>
                                </tr>
                            </thead>
                            <tbody>
                                {participants.data.length > 0 ? (
                                    participants.data.map((participant) => (
                                        <tr key={participant.id} className="border-b transition-colors hover:bg-muted/50">
                                            <td className="p-4 align-middle font-medium">{participant.name}</td>
                                            <td className="p-4 align-middle">{participant.email}</td>
                                            <td className="p-4 align-middle text-center">{participant.user_type}</td>
                                            <td className="p-4 align-middle text-center capitalize">{participant.payment_method}</td>
                                            <td className="p-4 align-middle text-center">
                                                <Badge variant="outline" className={cn(
                                                    "capitalize",
                                                    participant.payment_status === 'paid' && "bg-green-100 text-green-800",
                                                    participant.payment_status === 'pending' && "bg-orange-100 text-orange-800",
                                                    participant.payment_status === 'failed' && "bg-red-100 text-red-800",
                                                )}>
                                                    {participant.payment_status}
                                                </Badge>
                                            </td>
                                            <td className="p-4 align-middle text-right">₱{participant.amount}</td>
                                            <td className="p-4 align-middle text-right">{participant.registered_at}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="p-4 text-center text-muted-foreground">No participants found for the selected criteria.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination */}
                    {participants.last_page > 1 && (
                        <div className="flex items-center justify-between p-4 border-t no-print">
                            <p className="text-sm text-gray-600">
                                Showing {(participants.current_page - 1) * participants.per_page + 1} to{" "}
                                {Math.min(participants.current_page * participants.per_page, participants.total)} of{" "}
                                {participants.total} results
                            </p>
                            <Pagination className="w-auto mx-0">
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            href={participants.links[0].url || '#'}
                                            isActive={!participants.links[0].url}
                                            className={!participants.links[0].url ? 'pointer-events-none opacity-50' : ''}
                                        />
                                    </PaginationItem>

                                    {participants.links.slice(1, -1).map((link, i) => {
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
                                            href={participants.links[participants.links.length - 1].url || '#'}
                                            isActive={!participants.links[participants.links.length - 1].url}
                                            className={!participants.links[participants.links.length - 1].url ? 'pointer-events-none opacity-50' : ''}
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
                    <h2 className="text-xl text-gray-600">Tournament Participants: {tournament.name}</h2>
                </div>

                {/* Print Table */}
                <div className="border border-black">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-100 border-b border-black">
                            <tr>
                                <th className="p-2 border-r border-black text-left font-bold text-black">Participant Name</th>
                                <th className="p-2 border-r border-black text-left font-bold text-black">Email</th>
                                <th className="p-2 border-r border-black text-center font-bold text-black">Type</th>
                                <th className="p-2 border-r border-black text-center font-bold text-black">Payment Method</th>
                                <th className="p-2 border-r border-black text-center font-bold text-black">Status</th>
                                <th className="p-2 border-r border-black text-right font-bold text-black">Amount</th>
                                <th className="p-2 text-right font-bold text-black">Registered At</th>
                            </tr>
                        </thead>
                        <tbody>
                            {printData.map((participant) => (
                                <tr key={participant.id} className="border-b border-black">
                                    <td className="p-2 border-r border-black text-black font-semibold">{participant.name}</td>
                                    <td className="p-2 border-r border-black text-black">{participant.email}</td>
                                    <td className="p-2 border-r border-black text-center text-black">{participant.user_type}</td>
                                    <td className="p-2 border-r border-black text-center text-black capitalize">{participant.payment_method}</td>
                                    <td className="p-2 border-r border-black text-center text-black capitalize">{participant.payment_status}</td>
                                    <td className="p-2 border-r border-black text-right text-black">₱{participant.amount}</td>
                                    <td className="p-2 text-right text-black">{participant.registered_at}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AuthenticatedLayout>
    )
}
