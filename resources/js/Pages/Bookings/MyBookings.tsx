import { useState } from "react"
import { router } from "@inertiajs/react"
import { Calendar, Clock, Sun, Moon, Banknote, CreditCard, ChevronLeft, ChevronRight, Download, Copy, Check } from "lucide-react"

import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout"
import { Button } from "@/Components/ui/button"
import { Badge } from "@/Components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card"
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
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/Components/ui/pagination"

interface Booking {
    id: number
    schedule_type: string
    booking_date: string
    booking_date_full: string
    games_count: number
    with_trainer: boolean
    payment_method: string
    payment_reference: string
    payment_status: string
    total_amount: string
    discount_applied: string
    created_at: string
}

interface PageProps {
    auth: any
    bookings: {
        data: Booking[]
        current_page: number
        last_page: number
        per_page: number
        total: number
        links: { url: string | null; label: string; active: boolean }[]
    }
    gcashQrCode: string | null
}

export default function MyBookings({ auth, bookings, gcashQrCode }: PageProps) {
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
    const [showDialog, setShowDialog] = useState(false)
    const [showPaymentDialog, setShowPaymentDialog] = useState(false)
    const [copied, setCopied] = useState(false)

    const handleCardClick = (booking: Booking) => {
        setSelectedBooking(booking)
        setShowDialog(true)
    }

    const handlePageChange = (url: string | null) => {
        if (url) {
            router.get(url, {}, { preserveState: true })
        }
    }

    const handlePayNow = () => {
        setShowDialog(false)
        setTimeout(() => {
            setShowPaymentDialog(true)
        }, 150)
    }

    const handleCopyReference = () => {
        if (selectedBooking?.payment_reference) {
            navigator.clipboard.writeText(selectedBooking.payment_reference)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    const handleDownloadQR = () => {
        if (!gcashQrCode) return
        // Create a link to download the GCash QR image
        const link = document.createElement('a')
        link.href = gcashQrCode
        link.download = `GCash-QR-${selectedBooking?.payment_reference || 'payment'}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">My Bookings</h2>}
            breadcrumbs={[
                { label: 'Dashboard', href: route('dashboard') },
                { label: 'My Bookings' },
            ]}
        >
            <div className="py-8 bg-gray-50 min-h-screen">
                <div className="w-full px-4 sm:px-6 lg:px-8">
                    <Card className="border-none shadow-sm">
                        <CardHeader className="pb-4">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div>
                                    <CardTitle className="text-2xl font-bold">My Bookings</CardTitle>
                                    <CardDescription>View your court booking history</CardDescription>
                                </div>
                                <Button
                                    onClick={() => router.visit("/bookings/create")}
                                    className="bg-emerald-500 hover:bg-emerald-600"
                                >
                                    + Book Court
                                </Button>
                            </div>
                        </CardHeader>

                        <CardContent>
                            {bookings.data.length === 0 ? (
                                <div className="text-center py-12">
                                    <Calendar className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
                                    <p className="text-gray-500 mb-6">You haven't made any court bookings yet.</p>
                                    <Button
                                        onClick={() => router.visit("/bookings/create")}
                                        className="bg-emerald-500 hover:bg-emerald-600"
                                    >
                                        Book Your First Court
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    {/* Booking Cards Grid - 4 per row */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
                                        {bookings.data.map((booking) => (
                                            <div
                                                key={booking.id}
                                                onClick={() => handleCardClick(booking)}
                                                className="bg-white border border-gray-200 rounded-xl p-4 cursor-pointer hover:shadow-lg hover:border-emerald-300 transition-all duration-200 group"
                                            >
                                                {/* Header with Date & Schedule */}
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="flex items-center gap-2">
                                                        {booking.schedule_type === "day" ? (
                                                            <Sun className="h-5 w-5 text-orange-500" />
                                                        ) : (
                                                            <Moon className="h-5 w-5 text-indigo-500" />
                                                        )}
                                                        <span className="font-medium text-gray-900">{booking.booking_date}</span>
                                                    </div>
                                                    <Badge
                                                        variant={booking.payment_status === "paid" ? "default" : "secondary"}
                                                        className={booking.payment_status === "paid" ? "bg-green-500" : "bg-amber-500 text-white"}
                                                    >
                                                        {booking.payment_status === "paid" ? "Paid" : "Pending"}
                                                    </Badge>
                                                </div>

                                                {/* Details */}
                                                <div className="space-y-2 mb-3">
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <Clock className="h-4 w-4" />
                                                        <span>{booking.schedule_type === "day" ? "Day (6AM-6PM)" : "Night (6PM-10PM)"}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <Calendar className="h-4 w-4" />
                                                        <span>{booking.games_count} {booking.games_count === 1 ? "Game" : "Games"}</span>
                                                        {booking.with_trainer && (
                                                            <Badge variant="outline" className="text-xs border-purple-300 text-purple-600">+ Trainer</Badge>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        {booking.payment_method === "cash" ? (
                                                            <Banknote className="h-4 w-4 text-emerald-600" />
                                                        ) : (
                                                            <CreditCard className="h-4 w-4 text-blue-500" />
                                                        )}
                                                        <span className="capitalize">{booking.payment_method}</span>
                                                    </div>
                                                </div>

                                                {/* Amount */}
                                                <div className="pt-3 border-t border-gray-100">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm text-gray-500">Total</span>
                                                        <span className="text-lg font-bold text-emerald-600">₱{parseFloat(booking.total_amount).toFixed(2)}</span>
                                                    </div>
                                                    {parseFloat(booking.discount_applied) > 0 && (
                                                        <div className="text-right text-xs text-green-600">
                                                            Saved ₱{parseFloat(booking.discount_applied).toFixed(2)}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Hover indicator */}
                                                <div className="mt-3 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <span className="text-xs text-gray-400">Click to view details</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Pagination */}
                                    {bookings.last_page > 1 && (
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm text-gray-600">
                                                Showing {(bookings.current_page - 1) * bookings.per_page + 1} to{" "}
                                                {Math.min(bookings.current_page * bookings.per_page, bookings.total)} of{" "}
                                                {bookings.total} bookings
                                            </p>
                                            <div>
                                                <Pagination className="w-auto mx-0">
                                                    <PaginationContent>
                                                        <PaginationItem>
                                                            <PaginationPrevious
                                                                href={bookings.links[0].url || '#'}
                                                                isActive={!bookings.links[0].url}
                                                                className={!bookings.links[0].url ? 'pointer-events-none opacity-50' : ''}
                                                                preserveState
                                                            />
                                                        </PaginationItem>

                                                        {bookings.links.slice(1, -1).map((link, i) => {
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
                                                                href={bookings.links[bookings.links.length - 1].url || '#'}
                                                                isActive={!bookings.links[bookings.links.length - 1].url}
                                                                className={!bookings.links[bookings.links.length - 1].url ? 'pointer-events-none opacity-50' : ''}
                                                                preserveState
                                                            />
                                                        </PaginationItem>
                                                    </PaginationContent>
                                                </Pagination>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Booking Details Dialog */}
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">Booking Details</DialogTitle>
                        <DialogDescription>
                            {selectedBooking?.booking_date_full}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedBooking && (
                        <div className="space-y-4 py-4">
                            {/* Schedule Info */}
                            <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Schedule</h4>

                                <div className="flex items-center gap-3">
                                    {selectedBooking.schedule_type === "day" ? (
                                        <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                                            <Sun className="h-6 w-6 text-orange-500" />
                                        </div>
                                    ) : (
                                        <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                                            <Moon className="h-6 w-6 text-indigo-500" />
                                        </div>
                                    )}
                                    <div>
                                        <p className="font-medium text-gray-900">
                                            {selectedBooking.schedule_type === "day" ? "Day Schedule" : "Night Schedule"}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {selectedBooking.schedule_type === "day" ? "6:00 AM - 6:00 PM" : "6:00 PM - 10:00 PM"}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 pt-2">
                                    <div>
                                        <span className="text-sm text-gray-500">Number of Games</span>
                                        <p className="font-medium text-gray-900">{selectedBooking.games_count} {selectedBooking.games_count === 1 ? "game" : "games"}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-500">With Trainer</span>
                                        <p className="font-medium text-gray-900">{selectedBooking.with_trainer ? "Yes" : "No"}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Info */}
                            <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Payment</h4>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        {selectedBooking.payment_method === "cash" ? (
                                            <Banknote className="h-5 w-5 text-emerald-600" />
                                        ) : (
                                            <CreditCard className="h-5 w-5 text-blue-500" />
                                        )}
                                        <span className="font-medium capitalize">{selectedBooking.payment_method}</span>
                                    </div>
                                    <Badge
                                        variant={selectedBooking.payment_status === "paid" ? "default" : "secondary"}
                                        className={selectedBooking.payment_status === "paid" ? "bg-green-500" : "bg-amber-500 text-white"}
                                    >
                                        {selectedBooking.payment_status === "paid" ? "Paid" : "Pending"}
                                    </Badge>
                                </div>

                                {/* Reference Number */}
                                <div className="bg-white rounded-md p-3 border border-gray-200">
                                    <span className="text-xs text-gray-500">Reference Number</span>
                                    <p className="font-mono font-bold text-lg text-gray-900">{selectedBooking.payment_reference}</p>
                                </div>

                                <div className="border-t border-gray-200 pt-3 space-y-2">
                                    {parseFloat(selectedBooking.discount_applied) > 0 && (
                                        <div className="flex justify-between text-sm text-emerald-600">
                                            <span>Member Discount</span>
                                            <span>-₱{parseFloat(selectedBooking.discount_applied).toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span className="text-lg font-bold text-gray-900">Total Amount</span>
                                        <span className="text-lg font-bold text-emerald-600">₱{parseFloat(selectedBooking.total_amount).toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Booking Meta */}
                            <div className="text-xs text-gray-400 text-center">
                                Booked on {selectedBooking.created_at}
                            </div>
                        </div>
                    )}

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowDialog(false)}
                        >
                            Close
                        </Button>
                        {selectedBooking?.payment_status === "pending" && (
                            <Button
                                type="button"
                                onClick={handlePayNow}
                                className="bg-emerald-500 hover:bg-emerald-600"
                            >
                                Pay Now - ₱{parseFloat(selectedBooking.total_amount).toFixed(2)}
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Payment Instructions Dialog */}
            <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">Payment Instructions</DialogTitle>
                        <DialogDescription>
                            Follow these steps to complete your payment
                        </DialogDescription>
                    </DialogHeader>

                    {selectedBooking && (
                        <div className="space-y-4 py-4">
                            {/* Reference Number Card */}
                            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <span className="text-xs text-emerald-600 font-medium">Your Reference Number</span>
                                        <p className="font-mono font-bold text-2xl text-emerald-700">{selectedBooking.payment_reference}</p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleCopyReference}
                                        className="border-emerald-300 text-emerald-600 hover:bg-emerald-100"
                                    >
                                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                        {copied ? "Copied!" : "Copy"}
                                    </Button>
                                </div>
                            </div>

                            {/* Amount to Pay */}
                            <div className="text-center py-2">
                                <span className="text-sm text-gray-500">Amount to Pay</span>
                                <p className="text-3xl font-bold text-gray-900">₱{parseFloat(selectedBooking.total_amount).toFixed(2)}</p>
                            </div>

                            {/* Payment Steps */}
                            {selectedBooking.payment_method === "cash" ? (
                                <div className="bg-slate-50 rounded-lg p-4 space-y-4">
                                    <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                        <Banknote className="h-5 w-5 text-emerald-600" />
                                        Cash Payment Steps
                                    </h4>
                                    <ol className="space-y-3">
                                        <li className="flex gap-3">
                                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500 text-white text-sm font-bold flex items-center justify-center">1</span>
                                            <div>
                                                <p className="font-medium text-gray-900">Show Reference Number to Staff</p>
                                                <p className="text-sm text-gray-500">Present your reference number <span className="font-mono font-bold">{selectedBooking.payment_reference}</span> to a staff member at the counter</p>
                                            </div>
                                        </li>
                                        <li className="flex gap-3">
                                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500 text-white text-sm font-bold flex items-center justify-center">2</span>
                                            <div>
                                                <p className="font-medium text-gray-900">Pay the Amount</p>
                                                <p className="text-sm text-gray-500">Pay ₱{parseFloat(selectedBooking.total_amount).toFixed(2)} in cash</p>
                                            </div>
                                        </li>
                                        <li className="flex gap-3">
                                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500 text-white text-sm font-bold flex items-center justify-center">3</span>
                                            <div>
                                                <p className="font-medium text-gray-900">Done!</p>
                                                <p className="text-sm text-gray-500">Your booking will be confirmed once payment is verified</p>
                                            </div>
                                        </li>
                                    </ol>
                                </div>
                            ) : (
                                <div className="bg-slate-50 rounded-lg p-4 space-y-4">
                                    <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                        <CreditCard className="h-5 w-5 text-blue-500" />
                                        GCash Payment Steps
                                    </h4>
                                    <ol className="space-y-3">
                                        <li className="flex gap-3">
                                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white text-sm font-bold flex items-center justify-center">1</span>
                                            <div>
                                                <p className="font-medium text-gray-900">Open GCash App</p>
                                                <p className="text-sm text-gray-500">Open your GCash mobile app and select "Scan QR"</p>
                                            </div>
                                        </li>
                                        <li className="flex gap-3">
                                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white text-sm font-bold flex items-center justify-center">2</span>
                                            <div className="w-full">
                                                <p className="font-medium text-gray-900">Scan or Download QR Code</p>
                                                <div className="mt-2 bg-white border border-gray-200 rounded-lg p-4 text-center">
                                                    <div className="w-40 h-40 mx-auto bg-gray-100 rounded-lg flex items-center justify-center mb-3">
                                                        {gcashQrCode ? (
                                                            <img
                                                                src={gcashQrCode}
                                                                alt="GCash QR Code"
                                                                className="w-full h-full object-contain rounded-lg"
                                                            />
                                                        ) : (
                                                            <div className="text-gray-400 text-sm text-center">
                                                                QR Code<br />Not Available
                                                            </div>
                                                        )}
                                                    </div>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={handleDownloadQR}
                                                        className="border-blue-300 text-blue-600 hover:bg-blue-50"
                                                    >
                                                        <Download className="h-4 w-4 mr-2" />
                                                        Download QR Code
                                                    </Button>
                                                </div>
                                            </div>
                                        </li>
                                        <li className="flex gap-3">
                                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white text-sm font-bold flex items-center justify-center">3</span>
                                            <div>
                                                <p className="font-medium text-gray-900">Pay the Amount</p>
                                                <p className="text-sm text-gray-500">Enter ₱{parseFloat(selectedBooking.total_amount).toFixed(2)} and complete the payment</p>
                                            </div>
                                        </li>
                                        <li className="flex gap-3">
                                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white text-sm font-bold flex items-center justify-center">4</span>
                                            <div>
                                                <p className="font-medium text-gray-900">Show Payment Receipt to Staff</p>
                                                <p className="text-sm text-gray-500">Show your GCash payment receipt and reference number <span className="font-mono font-bold">{selectedBooking.payment_reference}</span> to staff</p>
                                            </div>
                                        </li>
                                        <li className="flex gap-3">
                                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white text-sm font-bold flex items-center justify-center">5</span>
                                            <div>
                                                <p className="font-medium text-gray-900">Done!</p>
                                                <p className="text-sm text-gray-500">Your booking will be confirmed once payment is verified</p>
                                            </div>
                                        </li>
                                    </ol>
                                </div>
                            )}
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            type="button"
                            onClick={() => setShowPaymentDialog(false)}
                            className="w-full bg-emerald-500 hover:bg-emerald-600"
                        >
                            Got it!
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AuthenticatedLayout>
    )
}
