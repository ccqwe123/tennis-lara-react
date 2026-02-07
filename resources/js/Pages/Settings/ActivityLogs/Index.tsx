import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout"
import { Head, router } from "@inertiajs/react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/Components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card"
import { Input } from "@/Components/ui/input"
import { Button } from "@/Components/ui/button"
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/Components/ui/pagination"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select"
import { Activity, Search, History } from "lucide-react"
import { useState } from "react"
import { Label } from "@/Components/ui/label"

interface Log {
    id: number
    user: {
        id: number
        name: string
        type: string
    } | null
    action: string
    description: string | null
    subject_type: string | null
    subject_id: number | null
    ip_address: string | null
    created_at: string
}

interface PaginatedLogs {
    data: Log[]
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
    logs: PaginatedLogs
    filters: {
        date?: string
        user_id?: string
        action?: string
        search?: string
    }
    actions: string[]
}

export default function ActivityLogsIndex({ logs, filters, actions }: Props) {
    const [searchAction, setSearchAction] = useState(filters.action || "")
    const [searchDate, setSearchDate] = useState(filters.date || "")
    const [searchQuery, setSearchQuery] = useState(filters.search || "")

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        router.get(route('activity-logs.index'), {
            action: searchAction,
            date: searchDate,
            search: searchQuery
        }, { preserveState: true })
    }

    const clearFilters = () => {
        setSearchAction("")
        setSearchDate("")
        setSearchQuery("")
        router.get(route('activity-logs.index'), {}, { preserveState: true })
    }

    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Activity Logs</h2>}>
            <Head title="Activity Logs" />

            <div className="py-6 px-4 sm:px-6 lg:px-8 space-y-6">
                <div className="grid gap-4 md:grid-cols-1">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Activity History</CardTitle>
                            <History className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 items-end mb-4">
                                <div className="space-y-2 w-full sm:w-auto">
                                    <Label htmlFor="date">Date</Label>
                                    <Input
                                        id="date"
                                        type="date"
                                        value={searchDate}
                                        onChange={(e) => setSearchDate(e.target.value)}
                                        className="w-full sm:w-[200px]"
                                    />
                                </div>
                                <div className="space-y-0 w-full sm:w-[250px]">
                                    <Label htmlFor="action" className="mb-2">Action</Label>
                                    <Select
                                        value={searchAction}
                                        onValueChange={(value) => setSearchAction(value === "all" ? "" : value)}
                                    >
                                        <SelectTrigger id="action" className="w-full h-7">
                                            <SelectValue placeholder="Select action" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Actions</SelectItem>
                                            {actions.map((action) => (
                                                <SelectItem key={action} value={action}>
                                                    {action}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2 w-full sm:w-auto flex-1">
                                    <Label htmlFor="search">Search</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            id="search"
                                            placeholder="Search description, user..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full"
                                        />
                                        <Button type="submit" size="icon" variant="ghost">
                                            <Search className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                {(filters.date || filters.action || filters.search) && (
                                    <Button type="button" variant="outline" onClick={clearFilters} className="mb-0.5">
                                        Clear
                                    </Button>
                                )}
                            </form>

                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[180px]">Date & Time</TableHead>
                                            <TableHead className="w-[150px]">User</TableHead>
                                            <TableHead className="w-[150px]">Action</TableHead>
                                            <TableHead>Description</TableHead>
                                            <TableHead className="w-[120px]">IP Address</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {logs.data.length > 0 ? (
                                            logs.data.map((log) => (
                                                <TableRow key={log.id}>
                                                    <TableCell className="text-xs text-muted-foreground">
                                                        {log.created_at}
                                                    </TableCell>
                                                    <TableCell className="font-medium">
                                                        {log.user ? (
                                                            <div className="flex flex-col">
                                                                <span>{log.user.name}</span>
                                                                <span className="text-xs text-muted-foreground capitalize">{log.user.type}</span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-muted-foreground italic">System / Deleted</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                            {log.action}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="max-w-[300px] truncate" title={log.description || ''}>
                                                        {log.description || '-'}
                                                    </TableCell>
                                                    <TableCell className="text-xs font-mono text-muted-foreground">
                                                        {log.ip_address || '-'}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={5} className="h-24 text-center">
                                                    No activity logs found.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Pagination */}
                            {logs.last_page > 1 && (
                                <div className="mt-4 flex items-center justify-between">
                                    <p className="text-sm text-gray-600">
                                        Showing {(logs.current_page - 1) * logs.per_page + 1} to{" "}
                                        {Math.min(logs.current_page * logs.per_page, logs.total)} of{" "}
                                        {logs.total} results
                                    </p>
                                    <Pagination className="w-auto mx-0">
                                        <PaginationContent>
                                            <PaginationItem>
                                                <PaginationPrevious
                                                    href={logs.links[0].url || '#'}
                                                    isActive={!logs.links[0].url}
                                                    className={!logs.links[0].url ? 'pointer-events-none opacity-50' : ''}
                                                />
                                            </PaginationItem>

                                            {logs.links.slice(1, -1).map((link, i) => {
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
                                                    href={logs.links[logs.links.length - 1].url || '#'}
                                                    isActive={!logs.links[logs.links.length - 1].url}
                                                    className={!logs.links[logs.links.length - 1].url ? 'pointer-events-none opacity-50' : ''}
                                                />
                                            </PaginationItem>
                                        </PaginationContent>
                                    </Pagination>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout >
    )
}
