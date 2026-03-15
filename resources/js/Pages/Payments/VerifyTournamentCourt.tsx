import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout"
import { Head, router } from "@inertiajs/react"
import { useState } from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Check, Filter, Loader2, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/Components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card"
import { StatusBadge } from "@/Components/StatusBadge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/Components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/Components/ui/popover"
import { Calendar } from "@/Components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select"
import { toast } from "sonner"

interface PaymentRecord {
    id: number
    reference: string
    customer: string
    tournament_name: string
    amount: number | string
    date: string
    method: string
}

interface Tournament {
    id: number
    name: string
}

interface Props {
    auth: any
    unpaid: PaymentRecord[]
    paid: PaymentRecord[]
    cancelled: PaymentRecord[]
    tournaments: Tournament[]
    filters: { date: string; tab?: string; tournament_id?: string }
    isAdmin: boolean
}

export default function VerifyTournamentCourt({ unpaid, paid, cancelled, tournaments, filters, isAdmin }: Props) {
    const [date, setDate] = useState<Date | undefined>(filters.date ? new Date(filters.date) : undefined)
    const [tournamentId, setTournamentId] = useState<string>(filters.tournament_id ?? '')
    const [selectedRecord, setSelectedRecord] = useState<PaymentRecord | null>(null)
    const [isMarkPaidOpen, setIsMarkPaidOpen] = useState(false)
    const [isMarkPendingOpen, setIsMarkPendingOpen] = useState(false)
    const [processing, setProcessing] = useState(false)

    const navigate = (overrides: Record<string, string>) =>
        router.get(route('payments.verify.tournament-court'), {
            date: date ? format(date, 'yyyy-MM-dd') : '',
            tab: filters.tab ?? 'unpaid',
            tournament_id: tournamentId,
            ...overrides,
        }, { preserveState: true, replace: true })

    const handleDateChange = (newDate: Date | undefined) => {
        if (date && newDate?.getTime() === date.getTime()) newDate = undefined
        setDate(newDate)
        navigate({ date: newDate ? format(newDate, 'yyyy-MM-dd') : '' })
    }

    const handleTournamentChange = (val: string) => {
        const next = val === 'all' ? '' : val
        setTournamentId(next)
        navigate({ tournament_id: next })
    }

    const handleTabChange = (val: string) => navigate({ tab: val })

    const submitStatus = (status: 'paid' | 'pending') => {
        if (!selectedRecord) return
        setProcessing(true)
        router.post(route('payments.verify.tournament-court.pay', selectedRecord.id), { status }, {
            onSuccess: () => {
                setIsMarkPaidOpen(false)
                setIsMarkPendingOpen(false)
                setSelectedRecord(null)
                setProcessing(false)
                toast.success(status === 'paid' ? 'Payment confirmed.' : 'Payment marked as pending.')
            },
            onError: () => { setProcessing(false); toast.error('Failed to update payment.') },
        })
    }

    const totalUnpaid = unpaid.reduce((s, i) => s + Number(i.amount), 0)
    const totalPaid = paid.reduce((s, i) => s + Number(i.amount), 0)

    const columns = (
        <>
            <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Date</th>
            <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Customer</th>
            <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Tournament</th>
            <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Method</th>
            <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Amount</th>
            <th className="h-10 px-4 text-right align-middle font-medium text-muted-foreground">Action</th>
        </>
    )

    const renderRow = (record: PaymentRecord, action: React.ReactNode) => (
        <tr key={record.id} className="border-b transition-colors hover:bg-muted/50">
            <td className="p-4 align-middle">{record.date}</td>
            <td className="p-4 align-middle font-medium">{record.customer}</td>
            <td className="p-4 align-middle">{record.tournament_name}</td>
            <td className="p-4 align-middle"><StatusBadge type="payment_method" value={record.method} /></td>
            <td className="p-4 align-middle font-bold">₱{Number(record.amount).toLocaleString()}</td>
            <td className="p-4 align-middle text-right">{action}</td>
        </tr>
    )

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Tournament Court Payments</h2>}
            breadcrumbs={[
                { label: 'Dashboard', href: route('dashboard') },
                { label: 'Tournament Court Payments' },
            ]}
        >
            <Head title="Tournament Court Payments" />

            <div className="py-6 px-4 sm:px-6 lg:px-8 space-y-6">
                {isAdmin && (
                    <Card>
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg flex items-center gap-2"><Filter className="h-5 w-5" /> Filter Options</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col sm:flex-row gap-4">
                                {/* Date filter */}
                                <div className="flex-1 min-w-0 space-y-2 sm:max-w-xs">
                                    <label className="text-sm font-medium">Filter by Date</label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className={cn("w-full pl-3 text-left font-normal truncate", !date && "text-muted-foreground")}>
                                                {date ? format(date, "PPP") : <span>Pick a date</span>}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-full sm:w-auto p-0" align="start">
                                            <Calendar mode="single" selected={date} onSelect={handleDateChange} initialFocus />
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                {/* Tournament filter */}
                                <div className="flex-1 min-w-0 space-y-2 sm:max-w-xs">
                                    <label className="text-sm font-medium">Filter by Tournament</label>
                                    <Select value={tournamentId || 'all'} onValueChange={handleTournamentChange}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="All Tournaments" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Tournaments</SelectItem>
                                            {tournaments.map(t => (
                                                <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Show All */}
                                <div className="flex flex-shrink-0 w-full sm:w-auto items-end">
                                    <Button className="w-full sm:w-auto" onClick={() => {
                                        setDate(undefined)
                                        setTournamentId('')
                                        navigate({ date: '', tournament_id: '' })
                                    }}>Show All</Button>
                                </div>
                            </div>
                            <div className="text-sm text-gray-500 pt-2">
                                Showing payments for: <span className="font-semibold">{date ? format(date, "MMMM d, yyyy") : 'All Time'}</span>
                                {tournamentId && tournaments.find(t => String(t.id) === tournamentId) && (
                                    <> · <span className="font-semibold">{tournaments.find(t => String(t.id) === tournamentId)?.name}</span></>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                <Tabs defaultValue={filters.tab || "unpaid"} onValueChange={handleTabChange} className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mt-2 h-auto">
                        <TabsTrigger value="unpaid">Unpaid</TabsTrigger>
                        <TabsTrigger value="paid">Paid</TabsTrigger>
                        <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
                    </TabsList>

                    {/* Unpaid */}
                    <TabsContent value="unpaid" className="space-y-4 pt-4">
                        <Card>
                            <CardHeader className="py-4">
                                <CardTitle className="text-sm font-medium text-gray-500">Total Unpaid</CardTitle>
                                <div className="text-2xl font-bold text-orange-600">₱{totalUnpaid.toLocaleString()}</div>
                            </CardHeader>
                        </Card>
                        <Card>
                            <div className="rounded-md border overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 border-b"><tr>{columns}</tr></thead>
                                    <tbody>
                                        {unpaid.length > 0 ? unpaid.map(r => renderRow(r,
                                            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => { setSelectedRecord(r); setIsMarkPaidOpen(true) }}>
                                                <Check className="w-4 h-4 mr-2" /> Mark Paid
                                            </Button>
                                        )) : (
                                            <tr><td colSpan={6} className="p-8 text-center text-gray-500">No unpaid tournament court bookings found.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    </TabsContent>

                    {/* Paid */}
                    <TabsContent value="paid" className="space-y-4 pt-4">
                        <Card>
                            <CardHeader className="py-4">
                                <CardTitle className="text-sm font-medium text-gray-500">Total Paid</CardTitle>
                                <div className="text-2xl font-bold text-emerald-600">₱{totalPaid.toLocaleString()}</div>
                            </CardHeader>
                        </Card>
                        <Card>
                            <div className="rounded-md border overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 border-b"><tr>{columns}</tr></thead>
                                    <tbody>
                                        {paid.length > 0 ? paid.map(r => renderRow(r,
                                            <Button size="sm" className="bg-amber-600 hover:bg-amber-700" onClick={() => { setSelectedRecord(r); setIsMarkPendingOpen(true) }}>
                                                <X className="w-4 h-4 mr-2" /> Mark as Pending
                                            </Button>
                                        )) : (
                                            <tr><td colSpan={6} className="p-8 text-center text-gray-500">No paid tournament court bookings found.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    </TabsContent>

                    {/* Cancelled */}
                    <TabsContent value="cancelled" className="space-y-4 pt-4">
                        <Card>
                            <div className="rounded-md border overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 border-b"><tr>{columns}</tr></thead>
                                    <tbody>
                                        {cancelled.length > 0 ? cancelled.map(r => renderRow(r, <span className="text-sm text-gray-400">Cancelled</span>)) : (
                                            <tr><td colSpan={6} className="p-8 text-center text-gray-500">No cancelled tournament court bookings found.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Mark Paid Dialog */}
            <Dialog open={isMarkPaidOpen} onOpenChange={setIsMarkPaidOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Payment</DialogTitle>
                        <DialogDescription>Mark this tournament court booking as <strong>PAID</strong>?</DialogDescription>
                    </DialogHeader>
                    {selectedRecord && (
                        <div className="py-4 space-y-2">
                            <div className="flex justify-between"><span className="text-gray-500">Customer:</span><span className="font-medium">{selectedRecord.customer}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Tournament:</span><span className="font-medium">{selectedRecord.tournament_name}</span></div>
                            <div className="flex justify-between border-t pt-2 mt-2"><span className="text-gray-500">Amount:</span><span className="font-bold text-lg text-emerald-600">₱{Number(selectedRecord.amount).toLocaleString()}</span></div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsMarkPaidOpen(false)} disabled={processing}>Cancel</Button>
                        <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => submitStatus('paid')} disabled={processing}>
                            {processing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />} Confirm Payment
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Mark Pending Dialog */}
            <Dialog open={isMarkPendingOpen} onOpenChange={setIsMarkPendingOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Remove Payment</DialogTitle>
                        <DialogDescription>Mark this tournament court booking as <strong>PENDING</strong>?</DialogDescription>
                    </DialogHeader>
                    {selectedRecord && (
                        <div className="py-4 space-y-2">
                            <div className="flex justify-between"><span className="text-gray-500">Customer:</span><span className="font-medium">{selectedRecord.customer}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Tournament:</span><span className="font-medium">{selectedRecord.tournament_name}</span></div>
                            <div className="flex justify-between border-t pt-2 mt-2"><span className="text-gray-500">Amount:</span><span className="font-bold text-lg text-red-600">₱{Number(selectedRecord.amount).toLocaleString()}</span></div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsMarkPendingOpen(false)} disabled={processing}>Cancel</Button>
                        <Button className="bg-amber-600 hover:bg-amber-700" onClick={() => submitStatus('pending')} disabled={processing}>
                            {processing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <X className="w-4 h-4 mr-2" />} Mark as Pending
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AuthenticatedLayout>
    )
}
