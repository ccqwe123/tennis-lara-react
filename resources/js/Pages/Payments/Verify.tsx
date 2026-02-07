import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout"
import { Head, router, usePage } from "@inertiajs/react"
import { useState } from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Check, CreditCard, Filter, Loader2, Search } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/Components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card"
import { Input } from "@/Components/ui/input"
import { Badge } from "@/Components/ui/badge"
import { StatusBadge } from "@/Components/StatusBadge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/Components/ui/dialog"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/Components/ui/popover"
import { Calendar } from "@/Components/ui/calendar"
import { toast } from "sonner"

interface PaymentRecord {
    id: number
    reference: string
    customer: string
    amount: number | string
    expected_amount?: number | string
    status: string
    date: string
    details: string
    type: 'booking' | 'tournament'
    method: string
}

interface Props {
    auth: any
    bookings: PaymentRecord[]
    registrations: PaymentRecord[]
    filters: {
        date: string
    }
    isAdmin: boolean
}

export default function VerifyPayments({ auth, bookings, registrations, filters, isAdmin }: Props) {
    const [date, setDate] = useState<Date | undefined>(
        filters.date ? new Date(filters.date) : undefined
    )
    const [selectedRecord, setSelectedRecord] = useState<PaymentRecord | null>(null)
    const [isConfirmOpen, setIsConfirmOpen] = useState(false)
    const [processing, setProcessing] = useState(false)

    const handleDateChange = (newDate: Date | undefined) => {
        setDate(newDate)
        if (newDate) {
            router.get(route('payments.verify'), {
                date: format(newDate, "yyyy-MM-dd")
            }, { preserveState: true })
        }
    }

    const openConfirm = (record: PaymentRecord) => {
        setSelectedRecord(record)
        setIsConfirmOpen(true)
    }

    const confirmPayment = () => {
        if (!selectedRecord) return

        setProcessing(true)
        const routeName = selectedRecord.type === 'booking'
            ? 'payments.verify.booking.pay'
            : 'payments.verify.tournament.pay'

        router.post(route(routeName, selectedRecord.id), {}, {
            onSuccess: () => {
                setIsConfirmOpen(false)
                setSelectedRecord(null)
                setProcessing(false)
                toast.success("Payment marked as verified successfully.")
            },
            onError: () => {
                setProcessing(false)
                toast.error("Failed to verify payment.")
            }
        })
    }

    const totalUnpaidBookings = bookings.reduce((sum, item) => sum + Number(item.amount), 0)
    // For registrations, handle potential missing amount if logic varies, assuming amount is numeric
    const totalUnpaidRegistrations = registrations.reduce((sum, item) => sum + Number(item.amount || item.expected_amount || 0), 0)

    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Verify Payments</h2>}>
            <Head title="Verify Payments" />

            <div className="py-6 px-4 sm:px-6 lg:px-8 space-y-6">

                {/* Filters */}
                {isAdmin && (
                    <Card>
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Filter className="h-5 w-5" /> Filter Options
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col sm:flex-row gap-4 items-end">
                                <div className="space-y-2 flex-1 sm:max-w-xs">
                                    <label className="text-sm font-medium">Filter by Date</label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !date && "text-muted-foreground")}>
                                                {date ? format(date, "PPP") : <span>Pick a date</span>}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar mode="single" selected={date} onSelect={handleDateChange} initialFocus />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div className="text-sm text-gray-500 pb-2">
                                    Showing payments for: <span className="font-semibold">{date ? format(date, "MMMM d, yyyy") : 'All Time'}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <Tabs defaultValue="bookings" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                        <TabsTrigger value="bookings">Court Bookings</TabsTrigger>
                        <TabsTrigger value="tournaments">Tournament Registrations</TabsTrigger>
                    </TabsList>

                    {/* Bookings Content */}
                    <TabsContent value="bookings" className="space-y-4 pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card>
                                <CardHeader className="py-4">
                                    <CardTitle className="text-sm font-medium text-gray-500">Unpaid Bookings Today</CardTitle>
                                    <div className="text-2xl font-bold text-orange-600">₱{totalUnpaidBookings.toLocaleString()}</div>
                                </CardHeader>
                            </Card>
                        </div>

                        <Card>
                            <div className="rounded-md border">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 border-b">
                                        <tr>
                                            <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Reference</th>
                                            <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Customer</th>
                                            <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Details</th>
                                            <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Method</th>
                                            <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Amount</th>
                                            <th className="h-10 px-4 text-right align-middle font-medium text-muted-foreground">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {bookings.length > 0 ? (
                                            bookings.map((booking) => (
                                                <tr key={booking.id} className="border-b transition-colors hover:bg-muted/50">
                                                    <td className="p-4 align-middle font-mono">{booking.reference || '-'}</td>
                                                    <td className="p-4 align-middle font-medium">{booking.customer}</td>
                                                    <td className="p-4 align-middle">{booking.details}</td>
                                                    <td className="p-4 align-middle"><StatusBadge type="payment_method" value={booking.method} /></td>
                                                    <td className="p-4 align-middle font-bold">₱{Number(booking.amount).toLocaleString()}</td>
                                                    <td className="p-4 align-middle text-right">
                                                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => openConfirm(booking)}>
                                                            <Check className="w-4 h-4 mr-2" /> Mark Paid
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={6} className="p-8 text-center text-gray-500">No unpaid court bookings found for this date.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    </TabsContent>

                    {/* Tournaments Content */}
                    <TabsContent value="tournaments" className="space-y-4 pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card>
                                <CardHeader className="py-4">
                                    <CardTitle className="text-sm font-medium text-gray-500">Unpaid Registrations</CardTitle>
                                    <div className="text-2xl font-bold text-orange-600">₱{totalUnpaidRegistrations.toLocaleString()}</div>
                                </CardHeader>
                            </Card>
                        </div>

                        <Card>
                            <div className="rounded-md border">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 border-b">
                                        <tr>
                                            <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Date</th>
                                            <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Customer</th>
                                            <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Tournament</th>
                                            <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Method</th>
                                            <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Amount</th>
                                            <th className="h-10 px-4 text-right align-middle font-medium text-muted-foreground">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {registrations.length > 0 ? (
                                            registrations.map((reg) => (
                                                <tr key={reg.id} className="border-b transition-colors hover:bg-muted/50">
                                                    <td className="p-4 align-middle">{reg.date}</td>
                                                    <td className="p-4 align-middle font-medium">{reg.customer}</td>
                                                    <td className="p-4 align-middle">{reg.details}</td>
                                                    <td className="p-4 align-middle"><StatusBadge type="payment_method" value={reg.method} /></td>
                                                    <td className="p-4 align-middle font-bold">₱{Number(reg.amount || reg.expected_amount).toLocaleString()}</td>
                                                    <td className="p-4 align-middle text-right">
                                                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => openConfirm(reg)}>
                                                            <Check className="w-4 h-4 mr-2" /> Mark Paid
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={6} className="p-8 text-center text-gray-500">No unpaid registrations found for this date.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Confirmation Modal */}
            <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Payment</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to mark this payment as <strong>PAID</strong>?
                        </DialogDescription>
                    </DialogHeader>
                    {selectedRecord && (
                        <div className="py-4 space-y-2">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Customer:</span>
                                <span className="font-medium">{selectedRecord.customer}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Details:</span>
                                <span className="font-medium">{selectedRecord.details}</span>
                            </div>
                            <div className="flex justify-between border-t pt-2 mt-2">
                                <span className="text-gray-500">Amount to Collect:</span>
                                <span className="font-bold text-lg text-emerald-600">₱{Number(selectedRecord.amount || selectedRecord.expected_amount).toLocaleString()}</span>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsConfirmOpen(false)} disabled={processing}>Cancel</Button>
                        <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={confirmPayment} disabled={processing}>
                            {processing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
                            Confirm Payment
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </AuthenticatedLayout>
    )
}
