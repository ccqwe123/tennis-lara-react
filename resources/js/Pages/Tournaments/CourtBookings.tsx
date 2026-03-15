import { Head, Link, router } from "@inertiajs/react"
import { ChevronLeft } from "lucide-react"
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card"
import { Badge } from "@/Components/ui/badge"
import { Button } from "@/Components/ui/button"
import { StatusBadge } from "@/Components/StatusBadge"
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
    PaginationEllipsis,
} from "@/Components/ui/pagination"

interface Booking {
    id: number
    user_name: string
    user_email: string
    is_guest: boolean
    schedule_type: string
    booking_date: string
    games_count: number
    with_trainer: boolean
    payment_method: string
    payment_reference: string
    payment_status: string
    total_amount: string
    created_at: string
}

interface PaginatedBookings {
    data: Booking[]
    current_page: number
    last_page: number
    total: number
    links: { url: string | null; label: string; active: boolean }[]
}

interface PageProps {
    auth: any
    tournament: { id: number; name: string }
    bookings: PaginatedBookings
}

export default function CourtBookings({ auth, tournament, bookings }: PageProps) {
    const { data, total, last_page, links } = bookings
    const handleTogglePaid = (booking: Booking) => {
        router.patch(route("tournaments.court-bookings.pay", { tournament: tournament.id, booking: booking.id }))
    }

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Tournament Court Bookings</h2>}
            breadcrumbs={[
                { label: "Dashboard", href: route("dashboard") },
                { label: "Tournaments", href: route("tournaments.manage") },
                { label: tournament.name },
                { label: "Court Bookings" },
            ]}
        >
            <Head title={`Court Bookings - ${tournament.name}`} />

            <div className="py-8">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Link href={route("tournaments.participants", tournament.id)} className="flex items-center text-sm text-gray-500 hover:text-gray-900 mb-6">
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Back to Participants
                    </Link>

                    <Card className="border-none shadow-sm">
                        <CardHeader>
                            <CardTitle>{tournament.name} — Court Bookings ({total})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {data.length === 0 ? (
                                <p className="text-center text-gray-400 py-12">No court bookings yet.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b text-gray-500 text-left">
                                                <th className="pb-3 font-medium">Player</th>
                                                <th className="pb-3 font-medium">Date</th>
                                                <th className="pb-3 font-medium">Slot</th>
                                                <th className="pb-3 font-medium">Games</th>
                                                <th className="pb-3 font-medium">Trainer</th>
                                                <th className="pb-3 font-medium">Method</th>
                                                <th className="pb-3 font-medium">Reference</th>
                                                <th className="pb-3 font-medium">Amount</th>
                                                <th className="pb-3 font-medium">Status</th>
                                                <th className="pb-3 font-medium">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {data.map((booking) => (
                                                <tr key={booking.id} className="py-3">
                                                    <td className="py-3">
                                                        <p className="font-medium text-gray-900 flex items-center gap-2">
                                                            {booking.user_name}
                                                            {booking.is_guest && <Badge variant="secondary" className="text-xs">Guest</Badge>}
                                                        </p>
                                                        <p className="text-xs text-gray-400">{booking.user_email}</p>
                                                    </td>
                                                    <td className="py-3">{booking.booking_date}</td>
                                                    <td className="py-3 capitalize">{booking.schedule_type}</td>
                                                    <td className="py-3">{booking.games_count}</td>
                                                    <td className="py-3">{booking.with_trainer ? "Yes" : "No"}</td>
                                                    <td className="py-3 capitalize">{booking.payment_method}</td>
                                                    <td className="py-3 font-mono text-xs">{booking.payment_reference}</td>
                                                    <td className="py-3 font-semibold text-emerald-600">₱{parseFloat(booking.total_amount).toFixed(2)}</td>
                                                    <td className="py-3">
                                                        <StatusBadge type="payment_status" value={booking.payment_status} />
                                                    </td>
                                                    <td className="py-3">
                                                        <Button
                                                            size="sm"
                                                            variant={booking.payment_status === "paid" ? "outline" : "default"}
                                                            className={booking.payment_status !== "paid" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}
                                                            onClick={() => handleTogglePaid(booking)}
                                                        >
                                                            {booking.payment_status === "paid" ? "Mark Unpaid" : "Mark Paid"}
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {last_page > 1 && (
                                <Pagination className="mt-6">
                                    <PaginationContent>
                                        <PaginationItem>
                                            <PaginationPrevious
                                                href={links[0].url ?? "#"}
                                                className={!links[0].url ? "pointer-events-none opacity-50" : ""}
                                            />
                                        </PaginationItem>
                                        {links.slice(1, -1).map((link, i) => (
                                            <PaginationItem key={i}>
                                                {link.label === "..." ? (
                                                    <PaginationEllipsis />
                                                ) : (
                                                    <PaginationLink href={link.url ?? "#"} isActive={link.active}>
                                                        {link.label}
                                                    </PaginationLink>
                                                )}
                                            </PaginationItem>
                                        ))}
                                        <PaginationItem>
                                            <PaginationNext
                                                href={links[links.length - 1].url ?? "#"}
                                                className={!links[links.length - 1].url ? "pointer-events-none opacity-50" : ""}
                                            />
                                        </PaginationItem>
                                    </PaginationContent>
                                </Pagination>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    )
}
