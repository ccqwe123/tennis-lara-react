import { useState, useEffect } from "react"
import axios from "axios"
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout"
import { Head, useForm } from "@inertiajs/react"
import { Check, Crown, ChevronsUpDown, User as UserIcon, ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/Components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/Components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Link } from "@inertiajs/react"

interface PageProps {
    auth: any
    fees: { [key: string]: string }
    users: {
        id: number
        name: string
        type: string
        membership_status: string
        email: string
    }[]
}

export default function MembershipCreate({ auth, fees, users }: PageProps) {
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
    const [open, setOpen] = useState(false)
    const [openUserSelect, setOpenUserSelect] = useState(false)
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null)

    const form = useForm({
        type: 'monthly',
        payment_method: 'cash',
        user_id: null as number | null,
    })

    const plans = [
        {
            id: 'monthly',
            name: 'Monthly Member',
            price: fees.fee_membership_monthly,
            features: ['Access to member rates', 'Priority booking (7 days)', 'Cancel anytime'],
            color: 'bg-blue-500'
        },
        {
            id: 'annual',
            name: 'Annual Pro',
            price: fees.fee_membership_annual,
            features: ['All Monthly features', '2 Free Guest Passes', 'Save 20% vs Monthly'],
            featured: true,
            color: 'bg-emerald-600'
        },
        {
            id: 'lifetime',
            name: 'Lifetime Elite',
            price: fees.fee_membership_lifetime,
            features: ['Never pay fees again', 'VIP Locker Access', 'Exclusive Events'],
            color: 'bg-purple-600'
        }
    ]

    const handleSelectPlan = (planId: string) => {
        if (!selectedUserId) {
            // Ideally should show an error, but UI makes it hard to click anyway if disabled, 
            // but just in case:
            return
        }
        setSelectedPlan(planId)
        form.setData((data) => ({ ...data, type: planId, user_id: selectedUserId }))
        setOpen(true)
    }

    const submitSubscription = (e: React.FormEvent) => {
        e.preventDefault()
        form.post(route('memberships.store'), {
            onSuccess: () => setOpen(false)
        })
    }

    const currentPlanDetails = plans.find(p => p.id === selectedPlan)
    const targetUser = users.find(u => u.id === selectedUserId)

    const [searchResults, setSearchResults] = useState(users)
    const [searchQuery, setSearchQuery] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery) {
                setIsLoading(true)
                axios.get(route('api.users.search'), { params: { query: searchQuery } })
                    .then(response => {
                        setSearchResults(response.data)
                        setIsLoading(false)
                    })
                    .catch(() => setIsLoading(false))
            } else {
                setSearchResults(users) // Reset to initial list
            }
        }, 300)

        return () => clearTimeout(timer)
    }, [searchQuery, users])

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center space-x-4">
                    <Link href={route('memberships.index')}>
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">Assign Membership</h2>
                </div>
            }
        >
            <Head title="Assign Membership" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">

                    {/* User Selection First */}
                    <div className="max-w-3xl mx-auto mb-12">
                        <Card className="border-none shadow-md">
                            <CardHeader>
                                <CardTitle>1. Select Customer</CardTitle>
                                <CardDescription>Search for the customer you wish to upgrade.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <Popover open={openUserSelect} onOpenChange={setOpenUserSelect}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                aria-expanded={openUserSelect}
                                                className="w-full justify-between h-14 text-lg"
                                            >
                                                {selectedUserId
                                                    ? (users.find((u) => u.id === selectedUserId)?.name || searchResults.find(u => u.id === selectedUserId)?.name || "Selected User")
                                                    : "Search customer by name..."}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[calc(100vw-3rem)] sm:w-[500px] md:w-[600px] p-0" align="start">
                                            <Command shouldFilter={false}>
                                                <CommandInput
                                                    placeholder="Search name or email..."
                                                    autoFocus={true}
                                                    value={searchQuery}
                                                    onValueChange={setSearchQuery}
                                                    className="text-base h-12"
                                                />
                                                <CommandList>
                                                    <CommandEmpty className="text-base py-6">No customer found.</CommandEmpty>
                                                    <CommandGroup>
                                                        {searchResults.map((user) => (
                                                            <CommandItem
                                                                key={user.id}
                                                                value={`${user.name} ${user.email}`}
                                                                onSelect={() => {
                                                                    setSelectedUserId(user.id)
                                                                    setOpenUserSelect(false)
                                                                }}
                                                                className="py-3 text-base"
                                                            >
                                                                <Check
                                                                    className={cn(
                                                                        "mr-2 h-4 w-4",
                                                                        selectedUserId === user.id ? "opacity-100" : "opacity-0"
                                                                    )}
                                                                />
                                                                <div className="flex items-center justify-between w-full">
                                                                    <div className="flex flex-col">
                                                                        <span className="font-medium text-base">{user.name}</span>
                                                                        <span className="text-sm text-muted-foreground">{user.email}</span>
                                                                    </div>
                                                                    <Badge variant={user.membership_status === 'member' ? 'default' : 'secondary'} className={user.membership_status === 'member' ? 'bg-emerald-500' : ''}>
                                                                        {user.membership_status}
                                                                    </Badge>
                                                                </div>

                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>

                                    {selectedUserId && targetUser && (
                                        <div className="flex items-center p-4 bg-emerald-50 rounded-xl border border-emerald-100 mt-4 animate-in fade-in slide-in-from-top-2">
                                            <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mr-4">
                                                <UserIcon className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900 text-lg">{targetUser.name}</h4>
                                                <div className="flex gap-2 text-sm text-gray-600">
                                                    <span>Current Status:</span>
                                                    <span className={cn("font-medium capitalize", targetUser.membership_status === 'member' ? "text-emerald-600" : "text-gray-500")}>
                                                        {targetUser.membership_status}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Pricing Cards */}
                    <div className={cn("transition-all duration-500",
                        !selectedUserId ? "opacity-40 pointer-events-none blur-sm" : "opacity-100"
                    )}>
                        <h3 className="text-xl font-bold mb-6 text-gray-800 px-1">2. Choose Membership Plan</h3>
                        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                            {plans.map((plan) => (
                                <Card
                                    key={plan.id}
                                    className={`flex flex-col relative border-2 transition-all hover:border-emerald-200 cursor-pointer ${plan.featured ? 'border-emerald-500 shadow-xl scale-105 z-10' : 'border-transparent shadow-md'}`}
                                    onClick={() => handleSelectPlan(plan.id)}
                                >
                                    {plan.featured && (
                                        <div className="absolute -top-4 left-0 right-0 flex justify-center">
                                            <Badge className="bg-emerald-600 hover:bg-emerald-700 text-sm px-3 py-1">Best Value</Badge>
                                        </div>
                                    )}
                                    <CardHeader>
                                        <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                                        <CardDescription>
                                            <span className="text-4xl font-extrabold text-gray-900">₱{parseFloat(plan.price).toFixed(0)}</span>
                                            {plan.id !== 'lifetime' && <span className="text-gray-500 font-medium"> / {plan.id === 'monthly' ? 'mo' : 'yr'}</span>}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex-1">
                                        <ul className="space-y-4">
                                            {plan.features.map((feature, i) => (
                                                <li key={i} className="flex items-start text-sm text-gray-600">
                                                    <div className="mr-3 mt-0.5 rounded-full bg-green-100 p-1">
                                                        <Check className="h-3 w-3 text-green-600" />
                                                    </div>
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                    <CardFooter>
                                        <Button
                                            className={`w-full h-12 text-base font-semibold ${plan.featured ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
                                            variant={plan.featured ? 'default' : 'outline'}
                                        >
                                            Select {plan.name}
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Assignment</DialogTitle>
                        <DialogDescription>
                            Assigning <strong>{currentPlanDetails?.name}</strong> to <strong>{targetUser?.name}</strong>.
                            <br />Cost: <span className="text-emerald-600 font-bold">₱{currentPlanDetails?.price && parseFloat(currentPlanDetails.price).toFixed(2)}</span>
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={submitSubscription} className="space-y-4">
                        <div className="space-y-3">
                            <Label>Payment Method</Label>
                            <RadioGroup
                                defaultValue={form.data.payment_method}
                                onValueChange={(val) => form.setData('payment_method', val)}
                                className="flex flex-col space-y-2"
                            >
                                <div className="flex items-center space-x-3 border-2 border-slate-100 p-3 rounded-lg cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-colors [&:has([data-state=checked])]:border-emerald-500 [&:has([data-state=checked])]:bg-emerald-50">
                                    <RadioGroupItem value="cash" id="cash_mem" />
                                    <Label htmlFor="cash_mem" className="flex-1 cursor-pointer font-medium">Cash Payment</Label>
                                </div>
                                <div className="flex items-center space-x-3 border-2 border-slate-100 p-3 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors [&:has([data-state=checked])]:border-blue-500 [&:has([data-state=checked])]:bg-blue-50">
                                    <RadioGroupItem value="gcash" id="gcash_mem" />
                                    <Label htmlFor="gcash_mem" className="flex-1 cursor-pointer font-medium">GCash (e-Wallet)</Label>
                                </div>
                            </RadioGroup>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={form.processing} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                {form.processing ? "Processing..." : "Confirm & Pay"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

        </AuthenticatedLayout>
    )
}
