import { useState } from "react"
import { Head, router } from "@inertiajs/react"
import { Search, Calendar, Filter, Trophy, ChevronLeft, ChevronRight, X, Eye, Users, Pencil } from "lucide-react"

import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout"
import { Button } from "@/Components/ui/button"
import { Input } from "@/Components/ui/input"
import { Badge } from "@/Components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/Components/ui/table"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select"
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
    registration_fee: string
    max_participants: number | null
    status: 'open' | 'ongoing' | 'completed'
    registrations_count: number
    created_at: string
}

interface PageProps {
    auth: any
    tournaments: {
        data: Tournament[]
        current_page: number
        last_page: number
        per_page: number
        total: number
        links: { url: string | null; label: string; active: boolean }[]
    }
    filters: {
        search: string
        date_from: string
        date_to: string
        status: string
    }
}

export default function ManageTournaments({ auth, tournaments, filters }: PageProps) {
    const [search, setSearch] = useState(filters.search)
    const [dateFrom, setDateFrom] = useState(filters.date_from)
    const [dateTo, setDateTo] = useState(filters.date_to)
    const [status, setStatus] = useState(filters.status)

    const handleFilter = () => {
        router.get('/tournaments/manage', {
            search: search || undefined,
            date_from: dateFrom || undefined,
            date_to: dateTo || undefined,
            status: status || undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
        })
    }

    const handleClearFilters = () => {
        setSearch('')
        setDateFrom('')
        setDateTo('')
        setStatus('')
        router.get('/tournaments/manage', {}, {
            preserveState: true,
            preserveScroll: true,
        })
    }

    const handlePageChange = (url: string | null) => {
        if (url) {
            router.get(url, {}, { preserveState: true })
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'open':
                return <Badge className="bg-green-500 hover:bg-green-600 text-xs">Open</Badge>
            case 'ongoing':
                return <Badge className="bg-blue-500 hover:bg-blue-600 text-xs">Ongoing</Badge>
            case 'completed':
                return <Badge className="bg-gray-500 hover:bg-gray-600 text-xs">Completed</Badge>
            default:
                return <Badge variant="secondary" className="text-xs">{status}</Badge>
        }
    }

    const hasFilters = search || dateFrom || dateTo || status

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Manage Tournaments</h2>}
            breadcrumbs={[
                { label: 'Dashboard', href: route('dashboard') },
                { label: 'Manage Tournaments' },
            ]}
        >
            <Head title="Manage Tournaments" />

            <div className="py-8 bg-gray-50 min-h-screen">
                <div className="w-full px-4 sm:px-6 lg:px-8">
                    <Card className="border-none shadow-sm">
                        <CardHeader className="pb-4">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div>
                                    <CardTitle className="text-2xl font-bold flex items-center gap-2">
                                        <Trophy className="h-6 w-6 text-emerald-600" />
                                        Tournament Management
                                    </CardTitle>
                                    <p className="text-sm text-gray-500 mt-1">
                                        View and manage all tournaments
                                    </p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-sm text-gray-600">
                                        <span className="font-semibold">{tournaments.total}</span> total tournaments
                                    </span>
                                    <Button
                                        onClick={() => router.visit('/tournaments/create')}
                                        className="bg-emerald-500 hover:bg-emerald-600"
                                    >
                                        + Create Tournament
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent>
                            {/* Filters */}
                            <div className="bg-slate-50 rounded-lg p-4 mb-6">
                                <div className="flex flex-wrap items-end gap-4">
                                    {/* Search */}
                                    <div className="flex-1 min-w-[200px]">
                                        <label className="text-sm font-medium text-gray-700 mb-1 block">Search</label>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <Input
                                                type="text"
                                                placeholder="Search tournaments..."
                                                value={search}
                                                onChange={(e) => setSearch(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                                                className="!pl-9 p-4"
                                            />
                                        </div>
                                    </div>

                                    {/* Date From */}
                                    <div className="w-[160px]">
                                        <label className="text-sm font-medium text-gray-700 mb-1 block">From Date</label>
                                        <Input
                                            type="date"
                                            value={dateFrom}
                                            onChange={(e) => setDateFrom(e.target.value)}
                                            className="p-4"
                                        />
                                    </div>

                                    {/* Date To */}
                                    <div className="w-[160px]">
                                        <label className="text-sm font-medium text-gray-700 mb-1 block">To Date</label>
                                        <Input
                                            type="date"
                                            value={dateTo}
                                            onChange={(e) => setDateTo(e.target.value)}
                                            className="p-4"
                                        />
                                    </div>

                                    {/* Status */}
                                    <div className="w-[140px]">
                                        <label className="text-sm font-medium text-gray-700 mb-1 block">Status</label>
                                        <Select value={status} onValueChange={setStatus}>
                                            <SelectTrigger className="p-4 w-full">
                                                <SelectValue placeholder="All" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All</SelectItem>
                                                <SelectItem value="open">Open</SelectItem>
                                                <SelectItem value="ongoing">Ongoing</SelectItem>
                                                <SelectItem value="completed">Completed</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Filter Buttons */}
                                    <div className="flex items-center gap-2">
                                        <Button onClick={handleFilter} className="bg-emerald-500 hover:bg-emerald-600 p-4">
                                            <Filter className="h-4 w-4 mr-2" />
                                            Filter
                                        </Button>
                                        {hasFilters && (
                                            <Button variant="outline" onClick={handleClearFilters} className="p-4">
                                                <X className="h-4 w-4 mr-2" />
                                                Clear
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Tournament Table */}
                            <div className="border rounded-lg overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50">
                                            <TableHead className="font-semibold">Tournament</TableHead>
                                            <TableHead className="font-semibold">Start Date</TableHead>
                                            <TableHead className="font-semibold">End Date</TableHead>
                                            <TableHead className="font-semibold text-center">Status</TableHead>
                                            <TableHead className="font-semibold text-center">Participants</TableHead>
                                            <TableHead className="font-semibold text-right">Fee</TableHead>
                                            <TableHead className="font-semibold text-center">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {tournaments.data.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={7} className="text-center py-12">
                                                    <Trophy className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                                                    <p className="text-gray-500">No tournaments found</p>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            tournaments.data.map((tournament) => (
                                                <TableRow key={tournament.id} className="hover:bg-slate-50">
                                                    <TableCell>
                                                        <p className="font-medium text-gray-900">{tournament.name}</p>
                                                    </TableCell>
                                                    <TableCell className="text-gray-600">
                                                        <div className="flex items-center gap-2">
                                                            <Calendar className="h-4 w-4 text-gray-400" />
                                                            {tournament.start_date}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-gray-600">
                                                        {tournament.end_date}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        {getStatusBadge(tournament.status)}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <div className="flex items-center justify-center gap-1">
                                                            <Users className="h-4 w-4 text-gray-400" />
                                                            <span className="font-medium">{tournament.registrations_count}</span>
                                                            {tournament.max_participants && (
                                                                <span className="text-gray-400">/ {tournament.max_participants}</span>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right font-semibold text-emerald-600">
                                                        ₱{parseFloat(tournament.registration_fee).toFixed(2)}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <div className="flex items-center justify-center gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => router.visit(`/tournaments/${tournament.id}`)}
                                                                title="View Tournament"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => router.visit(`/tournaments/${tournament.id}/participants`)}
                                                                title="View Participants"
                                                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                            >
                                                                <Users className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => router.visit(`/tournaments/${tournament.id}/edit`)}
                                                                title="Edit"
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Pagination */}
                            {tournaments.last_page > 1 && (
                                <div className="flex items-center justify-between mt-6">
                                    <p className="text-sm text-gray-600">
                                        Showing {(tournaments.current_page - 1) * tournaments.per_page + 1} to{" "}
                                        {Math.min(tournaments.current_page * tournaments.per_page, tournaments.total)} of{" "}
                                        {tournaments.total} tournaments
                                    </p>
                                    <div>
                                        <Pagination className="w-auto mx-0">
                                            <PaginationContent>
                                                <PaginationItem>
                                                    <PaginationPrevious
                                                        href={tournaments.links[0].url || '#'}
                                                        isActive={!tournaments.links[0].url}
                                                        className={!tournaments.links[0].url ? 'pointer-events-none opacity-50' : ''}
                                                        preserveState
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
                                                            <PaginationLink
                                                                href={link.url || '#'}
                                                                isActive={link.active}
                                                                preserveState
                                                            >
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
                                                        preserveState
                                                    />
                                                </PaginationItem>
                                            </PaginationContent>
                                        </Pagination>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    )
}
