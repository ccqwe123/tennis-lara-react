import { useState } from "react"
import { Head, Link, router } from "@inertiajs/react"
import { ChevronLeft, CalendarDays, Trophy, XCircle } from "lucide-react"
import { toast } from "sonner"
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout"
import { Button } from "@/Components/ui/button"
import { Card, CardContent } from "@/Components/ui/card"
import { Badge } from "@/Components/ui/badge"
import { StatusBadge } from "@/Components/StatusBadge"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/Components/ui/dialog"
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
    links: { url: string | null; label: string; active: boolean }[]
}

interface PageProps {
    auth: any
    tournament: { id: number; name: string }
    bookings: PaginatedBookings
    gcashQrCode: string | null
}

export default function MyCourtBookings({ auth, tournament, bookings, gcashQrCode }: PageProps) {
    const [cancelTarget, setCancelTarget] = useState<Booking | null>(null)
    const [isCancelling, setIsCancelling] = useState(false)
    const { data, current_page, last_page, links } = bookings

    const handleCancel = () => {
        if (!cancelTarget) return
        setIsCancelling(true)
        router.post(route("tournaments.court-bookings.cancel", { tournament: tournament.id, booking: cancelTarget.id }), {}, {
            onSuccess: () => {
                toast.success("Booking cancelled.")
                setCancelTarget(null)
            },
            onError: () => toast.error("Failed to cancel booking."),
            onFinish: () => setIsCancelling(false),
        })
    }

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">My Tournament Court Bookings</h2>}
            breadcrumbs={[
                { label: "Dashboard", href: route("dashboard") },
                { label: "Tournaments", href: route("tournaments.index") },
                { label: tournament.name, href: route("tournaments.show", tournament.id) },
                { label: "My Court Bookings" },
            ]}
        >
            <Head title={`My Court Bookings - ${tournament.name}`} />

            <div className="py-8 bg-gray-50 min-h-screen">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-6">
                        <Link href={route("tournaments.show", tournament.id)} className="flex items-center text-sm text-gray-500 hover:text-gray-900">
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Back to {tournament.name}
                        </Link>
                        <Button
                            className="bg-emerald-600 hover:bg-emerald-700"
                            onClick={() => router.visit(route("tournaments.book-court", tournament.id))}
                        >
                            Book Another Court
                        </Button>
                    </div>

                    {data.length === 0 ? (
                        <Card className="border-none shadow-sm">
                            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                                <Trophy className="h-12 w-12 text-gray-300 mb-4" />
                                <p className="text-gray-500 text-lg font-medium">No court bookings yet</p>
                                <p className="text-gray-400 text-sm mt-1">Book a court to get started</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {data.map((booking) => (
                                <Card key={booking.id} className="border-none shadow-sm">
                                    <CardContent className="p-5">
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <CalendarDays className="h-4 w-4 text-emerald-600" />
                                                    <span className="font-semibold text-gray-900">{booking.booking_date}</span>
                                                    <Badge variant="outline" className="capitalize">{booking.schedule_type}</Badge>
                                                </div>
                                                <p className="text-sm text-gray-500">
                                                    {booking.games_count} game{booking.games_count > 1 ? "s" : ""}
                                                    {booking.with_trainer ? " · With Trainer" : ""}
                                                    {" · "}{booking.payment_method.toUpperCase()}
                                                </p>
                                                <p className="text-xs text-gray-400 font-mono">{booking.payment_reference}</p>
                                            </div>
                                            <div className="text-right space-y-2">
                                                <p className="text-lg font-bold text-emerald-600">₱{parseFloat(booking.total_amount).toFixed(2)}</p>
                                                <StatusBadge type="payment_status" value={booking.payment_status} />
                                                {booking.payment_status === "pending" && (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="text-red-500 hover:text-red-700 hover:bg-red-50 w-full"
                                                        onClick={() => setCancelTarget(booking)}
                                                    >
                                                        <XCircle className="h-4 w-4 mr-1" />
                                                        Cancel
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
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
                </div>
            </div>

            <Dialog open={!!cancelTarget} onOpenChange={(open) => { if (!open) setCancelTarget(null) }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cancel Booking</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to cancel this court booking? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    {cancelTarget && (
                        <div className="bg-slate-50 rounded-lg p-4 text-sm space-y-1">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Date</span>
                                <span className="font-medium">{cancelTarget.booking_date}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Slot</span>
                                <span className="font-medium capitalize">{cancelTarget.schedule_type}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Games</span>
                                <span className="font-medium">{cancelTarget.games_count}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Amount</span>
                                <span className="font-medium text-emerald-600">₱{parseFloat(cancelTarget.total_amount).toFixed(2)}</span>
                            </div>
                        </div>
                    )}
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setCancelTarget(null)} disabled={isCancelling}>Keep Booking</Button>
                        <Button
                            className="bg-red-600 hover:bg-red-700"
                            onClick={handleCancel}
                            disabled={isCancelling}
                        >
                            {isCancelling ? "Cancelling..." : "Yes, Cancel"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AuthenticatedLayout>
    )
}
