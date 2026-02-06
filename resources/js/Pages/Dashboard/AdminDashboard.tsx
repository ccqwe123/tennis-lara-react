import { Head, router } from "@inertiajs/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card"
import { Calendar, CreditCard, Users, DollarSign } from "lucide-react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs"
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

interface AdminDashboardProps {
    stats: {
        daily_bookings: number
        daily_paid: number
        daily_unpaid: number
        total_members: number
    }
    chart_data: { date: string; count: number }[]
    todays_players: {
        data: {
            id: number
            user_name: string
            user_type: string
            time: string
            court: string
            status: string
        }[]
        current_page: number
        last_page: number
        per_page: number
        total: number
        links: { url: string | null; label: string; active: boolean }[]
    }
    filters: {
        player_type: string
    }
}

export default function AdminDashboard({ stats, chart_data, todays_players, filters }: AdminDashboardProps) {
    const handleTabChange = (value: string) => {
        router.get('/dashboard', { player_type: value }, { preserveState: true, preserveScroll: true })
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Daily Bookings</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.daily_bookings}</div>
                        <p className="text-xs text-muted-foreground">Today's total bookings</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Paid Bookings</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.daily_paid}</div>
                        <p className="text-xs text-muted-foreground">Paid bookings for today</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Unpaid Bookings</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.daily_unpaid}</div>
                        <p className="text-xs text-muted-foreground">Pending payments for today</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Members</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total_members}</div>
                        <p className="text-xs text-muted-foreground">Active members</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Chart */}
                <Card className="col-span-4 h-full">
                    <CardHeader>
                        <CardTitle>Overview</CardTitle>
                        <CardDescription>Daily bookings for the last 30 days</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={chart_data}>
                                <XAxis
                                    dataKey="date"
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `${value}`}
                                />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Quick Actions & Player List */}
                <Card className="col-span-3 h-full flex flex-col">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Today's Players</CardTitle>
                                <CardDescription>List of players booked for today</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col">
                        <Tabs defaultValue={filters.player_type || "all"} className="w-full" onValueChange={handleTabChange}>
                            <TabsList className="grid w-full grid-cols-4">
                                <TabsTrigger value="all">All</TabsTrigger>
                                <TabsTrigger value="member">Mem</TabsTrigger>
                                <TabsTrigger value="non-member">Non</TabsTrigger>
                                <TabsTrigger value="guest">Guest</TabsTrigger>
                            </TabsList>
                            <TabsContent value={filters.player_type || "all"} className="mt-4 flex-1">
                                <div className="space-y-4">
                                    {todays_players.data.length > 0 ? (
                                        todays_players.data.map((player) => (
                                            <div key={player.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                                                <div>
                                                    <p className="font-medium text-sm">{player.user_name}</p>
                                                    <p className="text-xs text-muted-foreground">{player.time} - {player.court}</p>
                                                </div>
                                                <Badge variant={player.status === 'paid' ? 'default' : 'secondary'} className={player.status === 'paid' ? "bg-emerald-500 hover:bg-emerald-600" : ""}>
                                                    {player.status}
                                                </Badge>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-gray-500 text-center py-4">No players found.</p>
                                    )}
                                </div>
                            </TabsContent>
                        </Tabs>

                        {/* Pagination */}
                        <div className="mt-auto pt-4">
                            {todays_players.last_page > 1 && (
                                <Pagination className="w-auto mx-0 justify-end">
                                    <PaginationContent>
                                        <PaginationItem>
                                            <PaginationPrevious
                                                href={todays_players.links[0].url || '#'}
                                                isActive={!todays_players.links[0].url}
                                                className={!todays_players.links[0].url ? 'pointer-events-none opacity-50' : ''}
                                                preserveState
                                                preserveScroll
                                            />
                                        </PaginationItem>

                                        {todays_players.links.slice(1, -1).map((link, i) => {
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
                                                        preserveScroll
                                                    >
                                                        <span dangerouslySetInnerHTML={{ __html: link.label }}></span>
                                                    </PaginationLink>
                                                </PaginationItem>
                                            )
                                        })}

                                        <PaginationItem>
                                            <PaginationNext
                                                href={todays_players.links[todays_players.links.length - 1].url || '#'}
                                                isActive={!todays_players.links[todays_players.links.length - 1].url}
                                                className={!todays_players.links[todays_players.links.length - 1].url ? 'pointer-events-none opacity-50' : ''}
                                                preserveState
                                                preserveScroll
                                            />
                                        </PaginationItem>
                                    </PaginationContent>
                                </Pagination>
                            )}
                        </div>

                        <div className="mt-6 pt-6 border-t">
                            <h4 className="text-sm font-semibold mb-3">Quick Actions</h4>
                            <div className="grid grid-cols-2 gap-2">
                                <a href="/bookings/create" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2">
                                    New Booking
                                </a>
                                <a href="/tournaments/create" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2">
                                    Add Tournament
                                </a>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
