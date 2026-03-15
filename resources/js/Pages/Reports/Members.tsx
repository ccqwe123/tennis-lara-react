
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout"
import { Head, router } from "@inertiajs/react"
import { useState, useEffect } from "react"
import { format } from "date-fns"

import { Filter, Printer, Download, Search, Loader2 } from "lucide-react"
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
import { StatusBadge } from "@/Components/StatusBadge"

import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/Components/ui/pagination"

interface User {
    id: number
    name: string
    email: string
    type: string
    status: string
    last_payment_date: string
    subscription_end: string
}

interface PaginatedUsers {
    data: User[]
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

interface Stats {
    total_users: number
    active_members: number
    expired_members: number
}

interface Props {
    auth: any
    users: PaginatedUsers
    filters: any
    stats: Stats
    memberStatus: string[]
}

export default function MemberReports({ auth, users, filters, stats, memberStatus }: Props) {
    const [search, setSearch] = useState(filters.search || "")
    const [type, setType] = useState(filters.type || "all")
    const [status, setStatus] = useState(filters.status || "all")
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
            route("reports.members"),
            {
                search,
                type,
                status,
            },
            { preserveState: true }
        )
    }

    const handleExport = (exportFormat: 'pdf' | 'xlsx') => {
        const queryParams = new URLSearchParams({
            search,
            type,
            status,
            format: exportFormat
        }).toString()

        window.open(route("reports.members.export") + "?" + queryParams, '_blank')
    }

    const handlePrint = async () => {
        setIsPrinting(true)
        try {
            // Fetch all data for printing (JSON format)
            const response = await axios.get(route("reports.members.export"), {
                params: {
                    search,
                    type,
                    status,
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
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Members Report</h2>}
            breadcrumbs={[
                { label: 'Dashboard', href: route('dashboard') },
                { label: 'Reports' },
                { label: 'Members' },
            ]}
        >
            <Head title="Members Report" />

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
                    table { font-size: 8pt; width: 100% !important; border-collapse: collapse !important; }
                    thead { display: table-header-group; }
                    tr { break-inside: avoid; break-after: auto; }
                    th, td { 
                        padding: 4px !important; 
                        border: 1px solid #000 !important; 
                        color: #000 !important;
                        text-align: left;
                    }
                    th { local-align: center; background-color: #f0f0f0 !important; font-weight: bold !important; }
                    
                    /* Ensure table borders remain */
                    table, th, td {
                        border: 1px solid #000 !important;
                    }

                    /* Remove any shadows or borders from cards in print view if they leak */
                    .border, .shadow, .rounded-md {
                        border: none !important;
                        box-shadow: none !important;
                        border-radius: 0 !important;
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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Search */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Search</label>
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="search"
                                        placeholder="Search by name or email..."
                                        className="pl-8"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Type */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">User Type</label>
                                <Select value={type} onValueChange={setType}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="All types" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Types</SelectItem>
                                        {memberStatus.map((t) => (
                                            <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Status */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Subscription Status</label>
                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="All statuses" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Statuses</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="expired">Expired</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 mt-4">
                            <Button variant="outline" onClick={() => {
                                setSearch("")
                                setType("all")
                                setStatus("all")
                                router.visit(route('reports.members'))
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
                    <h2 className="text-xl font-bold text-gray-800">Results</h2>
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

                {/* Main Stats Summary - Non-Printable */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 no-print">
                    <Card>
                        <CardHeader className="py-4">
                            <CardTitle className="text-sm font-medium text-gray-500">Total Users</CardTitle>
                            <div className="text-2xl font-bold">{stats.total_users}</div>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="py-4">
                            <CardTitle className="text-sm font-medium text-gray-500">Active Memberships</CardTitle>
                            <div className="text-2xl font-bold text-emerald-600">{stats.active_members}</div>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="py-4">
                            <CardTitle className="text-sm font-medium text-gray-500">Expired Memberships</CardTitle>
                            <div className="text-2xl font-bold text-orange-600">{stats.expired_members}</div>
                        </CardHeader>
                    </Card>
                </div>

                {/* Data Table */}
                <Card>
                    <div className="rounded-md border">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Name</th>
                                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Email</th>
                                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Type</th>
                                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Last Payment</th>
                                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Subscription End</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.data.length > 0 ? (
                                    users.data.map((user) => (
                                        <tr key={user.id} className="border-b transition-colors hover:bg-muted/50">
                                            <td className="p-4 align-middle font-medium">{user.name}</td>
                                            <td className="p-4 align-middle">{user.email}</td>
                                            <td className="p-4 align-middle">
                                                <StatusBadge type="user_type" value={user.type} />
                                            </td>
                                            <td className="p-4 align-middle">
                                                <Badge variant={user.status === 'Active' ? 'default' : (user.status === 'Expired' ? 'destructive' : 'secondary')} className={user.status === 'Active' ? 'bg-emerald-500' : ''}>
                                                    {user.status}
                                                </Badge>
                                            </td>
                                            <td className="p-4 align-middle">{user.last_payment_date}</td>
                                            <td className="p-4 align-middle">{user.subscription_end}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="p-4 text-center text-muted-foreground">No users found for the selected criteria.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination */}
                    {users.last_page > 1 && (
                        <div className="flex items-center justify-between p-4 border-t no-print">
                            <p className="text-sm text-gray-600">
                                Showing {(users.current_page - 1) * users.per_page + 1} to{" "}
                                {Math.min(users.current_page * users.per_page, users.total)} of{" "}
                                {users.total} results
                            </p>
                            <Pagination className="w-auto mx-0">
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            href={users.links[0].url || '#'}
                                            isActive={!users.links[0].url}
                                            className={!users.links[0].url ? 'pointer-events-none opacity-50' : ''}
                                        />
                                    </PaginationItem>

                                    {users.links.slice(1, -1).map((link, i) => {
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
                                            href={users.links[users.links.length - 1].url || '#'}
                                            isActive={!users.links[users.links.length - 1].url}
                                            className={!users.links[users.links.length - 1].url ? 'pointer-events-none opacity-50' : ''}
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
                    <h2 className="text-xl text-gray-600">Members Report</h2>
                </div>

                {/* Stats for Print */}
                <div className="grid grid-cols-3 gap-4 mb-6 text-center border-b border-black pb-4">
                    <div>
                        <div className="text-sm text-gray-600">Total Users</div>
                        <div className="text-xl font-bold">{stats.total_users}</div>
                    </div>
                    <div>
                        <div className="text-sm text-gray-600">Active</div>
                        <div className="text-xl font-bold">{stats.active_members}</div>
                    </div>
                    <div>
                        <div className="text-sm text-gray-600">Expired</div>
                        <div className="text-xl font-bold">{stats.expired_members}</div>
                    </div>
                </div>

                {/* Print Table */}
                <div className="border border-black">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-100 border-b border-black">
                            <tr>
                                <th className="p-2 border-r border-black text-left font-bold text-black">Name</th>
                                <th className="p-2 border-r border-black text-left font-bold text-black">Email</th>
                                <th className="p-2 border-r border-black text-left font-bold text-black">Type</th>
                                <th className="p-2 border-r border-black text-left font-bold text-black">Status</th>
                                <th className="p-2 border-r border-black text-left font-bold text-black">Last Payment</th>
                                <th className="p-2 text-left font-bold text-black">Sub End</th>
                            </tr>
                        </thead>
                        <tbody>
                            {printData.map((user) => (
                                <tr key={user.id} className="border-b border-black">
                                    <td className="p-2 border-r border-black text-black font-semibold">{user.name}</td>
                                    <td className="p-2 border-r border-black text-black">{user.email}</td>
                                    <td className="p-2 border-r border-black text-black">{user.type_label || user.type}</td>
                                    <td className="p-2 border-r border-black text-black">{user.status_label || user.status}</td>
                                    <td className="p-2 border-r border-black text-black">{user.last_payment_date}</td>
                                    <td className="p-2 text-black">{user.subscription_end}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AuthenticatedLayout>
    )
}
