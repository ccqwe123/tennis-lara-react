import { useState } from "react"
import { router } from "@inertiajs/react"
import { toast } from "sonner"
import { ChevronLeft, Sun, Moon, Banknote, CreditCard, Check, ChevronsUpDown } from "lucide-react"
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout"
import { Head, Link } from "@inertiajs/react"
import { Button } from "@/Components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card"
import { Label } from "@/Components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/Components/ui/radio-group"
import { Switch } from "@/Components/ui/switch"
import { Input } from "@/Components/ui/input"
import { Badge } from "@/Components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/Components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/Components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/Components/ui/command"
import { cn } from "@/lib/utils"

interface User {
    id: number
    name: string
    username: string
    type: string
    membership_status: string
}

interface PageProps {
    auth: any
    tournament: { id: number; name: string; start_date: string; end_date: string }
    settings: { [key: string]: string }
    gcashQrCode: string | null
    isStaff: boolean
    isAdmin: boolean
    users: User[]
}

export default function BookCourt({ auth, tournament, settings, gcashQrCode, isStaff, isAdmin, users }: PageProps) {
    const [scheduleType, setScheduleType] = useState<"day" | "night">("day")
    const [gamesCount, setGamesCount] = useState(1)
    const [withTrainer, setWithTrainer] = useState(false)
    const [paymentMethod, setPaymentMethod] = useState<"cash" | "gcash">("cash")
    const [showConfirm, setShowConfirm] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Guest / user selection (staff & admin only)
    const [isGuest, setIsGuest] = useState(false)
    const [guestName, setGuestName] = useState("")
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
    const [openUserSelect, setOpenUserSelect] = useState(false)

    const isStaffOrAdmin = isStaff || isAdmin

    const selectedUser = isStaffOrAdmin && !isGuest && selectedUserId
        ? users.find(u => u.id === selectedUserId)
        : null

    const getRate = (slot: "day" | "night") => {
        const type = selectedUser?.type ?? (isStaffOrAdmin ? "non-member" : auth.user.type)
        if (type === "student") return 45
        if (type === "member") return slot === "day" ? 75 : 85
        return 150
    }

    const rate = getRate(scheduleType)
    const trainerFee = withTrainer ? parseFloat(settings.fee_trainer || "0") : 0
    const total = (rate + trainerFee) * gamesCount

    const handleSubmit = () => {
        setIsSubmitting(true)
        router.post(route("tournaments.book-court.store", tournament.id), {
            schedule_type: scheduleType,
            games_count: gamesCount,
            with_trainer: withTrainer,
            payment_method: paymentMethod,
            is_guest: isGuest,
            guest_name: isGuest ? guestName : null,
            user_id: isStaffOrAdmin && !isGuest ? selectedUserId : null,
        }, {
            onSuccess: () => toast.success("Court booked!", { description: "Please complete your payment." }),
            onError: () => {
                toast.error("Failed to book court. Please try again.")
                setIsSubmitting(false)
                setShowConfirm(false)
            },
            onFinish: () => setIsSubmitting(false),
        })
    }

    const customerLabel = isGuest
        ? (guestName || "Guest")
        : (selectedUser?.name ?? auth.user.name)

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Book Court for Tournament</h2>}
            breadcrumbs={[
                { label: "Dashboard", href: route("dashboard") },
                { label: "Tournaments", href: route("tournaments.index") },
                { label: tournament.name, href: route("tournaments.show", tournament.id) },
                { label: "Book Court" },
            ]}
        >
            <Head title={`Book Court - ${tournament.name}`} />

            <div className="py-8 bg-gray-50 min-h-screen">
                <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Link href={route("tournaments.show", tournament.id)} className="flex items-center text-sm text-gray-500 hover:text-gray-900 mb-6">
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Back to {tournament.name}
                    </Link>

                    <Card className="border-none shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-2xl font-bold">Book a Court</CardTitle>
                            <CardDescription>{tournament.name}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8">

                            {/* Customer Selection — Staff/Admin only */}
                            {isStaffOrAdmin && (
                                <div className="bg-slate-50 p-4 rounded-lg space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Customer</h3>
                                        <div className="flex items-center gap-2">
                                            <Switch
                                                checked={isGuest}
                                                onCheckedChange={(v) => {
                                                    setIsGuest(v)
                                                    setSelectedUserId(null)
                                                    setGuestName("")
                                                }}
                                            />
                                            <Label className="text-sm text-gray-600">Guest (No Account)</Label>
                                        </div>
                                    </div>

                                    {isGuest ? (
                                        <div className="space-y-2">
                                            <Label>Guest Name</Label>
                                            <Input
                                                placeholder="Enter guest name"
                                                value={guestName}
                                                onChange={(e) => setGuestName(e.target.value)}
                                                className="bg-white"
                                            />
                                        </div>
                                    ) : (
                                        <Popover open={openUserSelect} onOpenChange={setOpenUserSelect}>
                                            <PopoverTrigger asChild>
                                                <Button variant="outline" role="combobox" className="w-full justify-between bg-white h-12">
                                                    {selectedUser ? selectedUser.name : "Search registered member..."}
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-full p-0">
                                                <Command>
                                                    <CommandInput placeholder="Search player..." />
                                                    <CommandList>
                                                        <CommandEmpty>No player found.</CommandEmpty>
                                                        <CommandGroup>
                                                            {users.map((u) => (
                                                                <CommandItem
                                                                    key={u.id}
                                                                    value={u.name}
                                                                    onSelect={() => {
                                                                        setSelectedUserId(u.id)
                                                                        setOpenUserSelect(false)
                                                                    }}
                                                                >
                                                                    <Check className={cn("mr-2 h-4 w-4", u.id === selectedUserId ? "opacity-100" : "opacity-0")} />
                                                                    <div className="flex items-center justify-between w-full">
                                                                        <div className="flex flex-col">
                                                                            <span className="font-medium">{u.name}</span>
                                                                            <span className="text-xs text-muted-foreground">{u.username}</span>
                                                                        </div>
                                                                        <Badge variant={u.membership_status === "member" ? "default" : "secondary"} className={u.membership_status === "member" ? "bg-emerald-500" : ""}>
                                                                            {u.membership_status}
                                                                        </Badge>
                                                                    </div>
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                    )}
                                </div>
                            )}

                            {/* Time Slot */}
                            <div className="space-y-3">
                                <Label className="text-base font-semibold">Time Slot</Label>
                                <RadioGroup
                                    value={scheduleType}
                                    onValueChange={(v) => setScheduleType(v as "day" | "night")}
                                    className="grid grid-cols-2 gap-4"
                                >
                                    {(["day", "night"] as const).map((slot) => (
                                        <div key={slot}>
                                            <RadioGroupItem value={slot} id={`slot-${slot}`} className="peer sr-only" />
                                            <Label
                                                htmlFor={`slot-${slot}`}
                                                className={cn(
                                                    "flex flex-col items-center rounded-xl border bg-white p-4 cursor-pointer shadow-sm transition-all h-32 justify-center",
                                                    "hover:bg-gray-50 peer-data-[state=checked]:ring-2 peer-data-[state=checked]:ring-emerald-500 peer-data-[state=checked]:bg-emerald-50 peer-data-[state=checked]:border-transparent"
                                                )}
                                            >
                                                {slot === "day"
                                                    ? <Sun className={cn("mb-2 h-6 w-6", scheduleType === "day" ? "text-orange-500" : "text-gray-400")} />
                                                    : <Moon className={cn("mb-2 h-6 w-6", scheduleType === "night" ? "text-indigo-500" : "text-gray-400")} />
                                                }
                                                <span className="font-bold text-gray-900 capitalize">{slot}</span>
                                                <span className="text-xs text-gray-500">{slot === "day" ? "6AM - 6PM" : "6PM - 10PM"}</span>
                                                <span className="text-sm font-bold text-emerald-600 mt-1">₱{getRate(slot).toFixed(2)}</span>
                                            </Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            </div>

                            {/* Number of Games */}
                            <div className="space-y-3">
                                <Label className="text-base font-semibold">Number of Games</Label>
                                <div className="flex gap-4">
                                    {[1, 2, 3, 4].map((count) => (
                                        <Button
                                            key={count}
                                            type="button"
                                            variant="ghost"
                                            className={cn(
                                                "flex-1 h-14 text-xl font-bold rounded-xl border shadow-sm hover:bg-emerald-50 hover:text-emerald-600",
                                                gamesCount === count
                                                    ? "bg-emerald-500 text-white hover:bg-emerald-600 hover:text-white border-transparent"
                                                    : "bg-white text-gray-900 border-gray-200"
                                            )}
                                            onClick={() => setGamesCount(count)}
                                        >
                                            {count}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            {/* With Trainer */}
                            <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <p className="font-medium text-gray-900">Include Trainer (+₱{settings.fee_trainer})</p>
                                <Switch checked={withTrainer} onCheckedChange={setWithTrainer} />
                            </div>

                            {/* Payment Method */}
                            <div className="space-y-3">
                                <Label className="text-base font-semibold">Payment Method</Label>
                                <RadioGroup
                                    value={paymentMethod}
                                    onValueChange={(v) => setPaymentMethod(v as "cash" | "gcash")}
                                    className="grid grid-cols-2 gap-4"
                                >
                                    {[
                                        { value: "cash", label: "Cash", sub: "Pay at counter", icon: <Banknote className="mb-2 h-8 w-8 text-emerald-600" /> },
                                        { value: "gcash", label: "GCash", sub: "Pay online", icon: <CreditCard className="mb-2 h-8 w-8 text-blue-500" /> },
                                    ].map((opt) => (
                                        <div key={opt.value}>
                                            <RadioGroupItem value={opt.value} id={`pay-${opt.value}`} className="peer sr-only" />
                                            <Label
                                                htmlFor={`pay-${opt.value}`}
                                                className="flex flex-col items-center rounded-xl border bg-white p-6 cursor-pointer shadow-sm transition-all h-32 justify-center hover:bg-gray-50 peer-data-[state=checked]:ring-2 peer-data-[state=checked]:ring-emerald-500 peer-data-[state=checked]:bg-emerald-50 peer-data-[state=checked]:border-transparent"
                                            >
                                                {opt.icon}
                                                <span className="font-bold text-gray-900">{opt.label}</span>
                                                <span className="text-sm text-gray-500">{opt.sub}</span>
                                            </Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            </div>

                            {/* Summary */}
                            <div className="pt-6 border-t space-y-3">
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Court ({gamesCount} × ₱{rate.toFixed(2)})</span>
                                    <span>₱{(rate * gamesCount).toFixed(2)}</span>
                                </div>
                                {withTrainer && (
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>Trainer ({gamesCount} × ₱{trainerFee.toFixed(2)})</span>
                                        <span>₱{(trainerFee * gamesCount).toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between pt-2 border-t">
                                    <span className="text-xl font-bold text-gray-900">Total</span>
                                    <span className="text-xl font-bold text-emerald-600">₱{total.toFixed(2)}</span>
                                </div>

                                <Button
                                    size="lg"
                                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-lg h-14 rounded-xl mt-4"
                                    onClick={() => setShowConfirm(true)}
                                >
                                    Review Booking
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Confirm Dialog */}
            <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
                <DialogContent className="sm:max-w-[440px]">
                    <DialogHeader>
                        <DialogTitle>Confirm Court Booking</DialogTitle>
                        <DialogDescription>Review your booking for {tournament.name}</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        <div className="bg-slate-50 rounded-lg p-4 space-y-2 text-sm">
                            {isStaffOrAdmin && (
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Customer</span>
                                    <span className="font-medium flex items-center gap-2">
                                        {customerLabel}
                                        {isGuest && <Badge variant="secondary" className="text-xs">Guest</Badge>}
                                    </span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span className="text-gray-500">Time Slot</span>
                                <span className="font-medium capitalize">{scheduleType}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Games</span>
                                <span className="font-medium">{gamesCount}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">With Trainer</span>
                                <span className="font-medium">{withTrainer ? "Yes" : "No"}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Payment</span>
                                <span className="font-medium capitalize">{paymentMethod}</span>
                            </div>
                            <div className="flex justify-between pt-2 border-t font-bold text-base">
                                <span>Total</span>
                                <span className="text-emerald-600">₱{total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setShowConfirm(false)} disabled={isSubmitting}>Cancel</Button>
                        <Button
                            className="bg-emerald-500 hover:bg-emerald-600"
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Processing..." : `Confirm - ₱${total.toFixed(2)}`}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AuthenticatedLayout>
    )
}
