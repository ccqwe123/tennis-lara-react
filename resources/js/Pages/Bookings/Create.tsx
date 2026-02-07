import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Check, CreditCard, Banknote, Moon, Sun, ChevronsUpDown, User, Users } from "lucide-react"
import { router } from "@inertiajs/react"
import { toast } from "sonner"

import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout"
import { cn } from "@/lib/utils"
import { Button } from "@/Components/ui/button"
import { Input } from "@/Components/ui/input"
import { Calendar } from "@/Components/ui/calendar"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/Components/ui/form"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/Components/ui/popover"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/Components/ui/command"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/Components/ui/dialog"
import { Switch } from "@/Components/ui/switch"
import { Checkbox } from "@/Components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/Components/ui/radio-group"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card"
import { Label } from "@/Components/ui/label"
import { Badge } from "@/Components/ui/badge"

interface PageProps {
    auth: any
    settings: { [key: string]: string }
    users: {
        id: number
        name: string
        email: string
        type: string
        membership_status: string
        player_level: string | null
    }[]
    isStaff: boolean
}

const formSchema = z.object({
    user_id: z.number().nullable(),
    schedule_type: z.enum(["day", "night"]),
    booking_date: z.date(),
    games_count: z.number().min(1).max(4),
    with_trainer: z.boolean().default(false),
    payment_method: z.enum(["cash", "gcash"]),
    is_guest: z.boolean().optional(),
    picker_selection: z.array(z.boolean()).optional(),
    category: z.enum(["single", "double"]),
    priest_count: z.number().min(0).default(0),
})

export default function BookingCreate({ auth, settings, users, isStaff }: PageProps) {
    const [openUserSelect, setOpenUserSelect] = useState(false)
    const [showConfirmDialog, setShowConfirmDialog] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            user_id: isStaff ? null : auth.user.id,
            games_count: 1,
            with_trainer: false,
            schedule_type: "day",
            payment_method: "cash",
            booking_date: new Date(),
            is_guest: false,
            picker_selection: [false, false, false, false],
            category: "single",
            priest_count: 0,
        },
    })

    // Watchers & Calculations
    const values = form.watch()
    const isGuest = values.is_guest

    const selectedUser = !isGuest && values.user_id
        ? users.find(u => u.id === values.user_id)
        : (isStaff ? null : auth.user)

    // Pricing
    const getCourtRate = () => {
        const type = selectedUser?.type || (isGuest ? 'non-member' : 'non-member')

        if (type === 'student') return 45
        if (type === 'member') {
            return values.schedule_type === "day" ? 75 : 85
        }
        return 150 // Non-member / Guest
    }

    // Helper to get rate for a specific slot based on user type
    const getRateForSlot = (slot: 'day' | 'night') => {
        const type = selectedUser?.type || (isGuest ? 'non-member' : 'non-member')

        if (type === 'student') return 45
        if (type === 'member') {
            return slot === "day" ? 75 : 85
        }
        return 150 // Non-member / Guest
    }

    const courtRate = getCourtRate()
    const trainerFee = values.with_trainer ? parseFloat(settings.fee_trainer || "0") : 0
    const basePickerFee = parseFloat(settings.fee_picker || "80")
    const categoryDivisor = values.category === 'double' ? 4 : 2
    const priestCount = values.priest_count || 0
    const pickerDivisor = Math.max(1, categoryDivisor - priestCount)
    const pickerFee = basePickerFee / pickerDivisor

    // Calculate total picker fee based on selection and game count
    const activePickerCount = (values.picker_selection || []).slice(0, values.games_count).filter(Boolean).length
    const totalPickerFee = activePickerCount * pickerFee

    const subtotal = (courtRate * values.games_count) + (trainerFee * values.games_count) + totalPickerFee
    const total = subtotal

    const handleReviewBooking = async () => {
        const isValid = await form.trigger()
        if (isValid) {
            setShowConfirmDialog(true)
        }
    }

    function onConfirmBooking() {
        setIsSubmitting(true)
        const formValues = form.getValues()
        // Use hardcoded path to avoid missing 'route' type/function
        router.post('/bookings', {
            ...formValues,
            user_id: formValues.is_guest ? null : formValues.user_id
        }, {
            onSuccess: () => {
                toast.success('Booking Created!', {
                    description: 'Your court booking has been successfully created.',
                })
            },
            onFinish: () => setIsSubmitting(false)
        })
    }

    return (
        <AuthenticatedLayout
            header= {< h2 className = "font-semibold text-xl text-gray-800 leading-tight" > Booking Details </h2>
}
        >
    <div className="py-8 bg-gray-50 min-h-screen" >
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8" >
            <Form { ...form } >
            <form onSubmit={ (e) => { e.preventDefault(); handleReviewBooking(); } } className = "space-y-6" >

                <Card className="border-none shadow-sm bg-white" >
                    <CardHeader className="pb-4" >
                        <CardTitle className="text-2xl font-bold" > Booking Details </CardTitle>
                            < CardDescription > Select your preferred date, time, and number of games </CardDescription>
                                </CardHeader>

                                < CardContent className = "space-y-8" >

                                    {/* 0. Guest / User Selection (Only for Staff) */ }
{
    isStaff && (
        <div className="bg-slate-50 p-4 rounded-lg space-y-4" >
            <div className="flex items-center justify-between" >
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider" > Customer Information </h3>
                    < div className = "flex items-center space-x-2" >
                        <Switch
                                                        checked={ isGuest }
    onCheckedChange = {(checked) => {
        form.setValue('is_guest', checked)
        if (checked) form.setValue('user_id', null)
    }
}
                                                    />
    < Label className = "text-sm text-gray-600" > Guest(No Account) </Label>
        </div>
        </div>

{
    !isGuest && (
        <FormField
                                                    control={ form.control }
    name = "user_id"
    render = {({ field }) => (
        <FormItem className= "flex flex-col" >
        <Popover open={ openUserSelect } onOpenChange = { setOpenUserSelect } >
            <PopoverTrigger asChild >
            <FormControl>
            <Button
                                                                            variant="outline"
    role = "combobox"
    className = {
        cn(
                                                                                "w-full justify-between h-12",
                                                                                !field.value && "text-muted-foreground"
                                                                            )
    }
        >
    {
        field.value
            ? users.find((u) => u.id === field.value)?.name
            : "Search registered member..."
    }
        < ChevronsUpDown className = "ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
            </FormControl>
            </PopoverTrigger>
            < PopoverContent className = "w-[300px] sm:w-[500px] md:w-[635px] p-0" >
                <Command>
                <CommandInput placeholder="Search player..." />
                    <CommandList>
                    <CommandEmpty>No player found.</CommandEmpty>
                        <CommandGroup>
    {
        users.map((user) => (
            <CommandItem
                                                                                        value= { user.name }
                                                                                        key = { user.id }
                                                                                        onSelect = {() => {
            form.setValue("user_id", user.id)
                                                                                            setOpenUserSelect(false)
        }}
                                                                                    >
        <Check
                                                                                            className={
        cn(
            "mr-2 h-4 w-4",
            user.id === field.value
                ? "opacity-100"
                : "opacity-0"
        )
    }
                                                                                        />
        < div className = "flex items-center justify-between w-full" >
            <div className="flex flex-col" >
                <span className="font-medium text-base" > { user.name } </span>
                    < span className = "text-sm text-muted-foreground" > { user.email } </span>
                        </div>
                        < Badge variant = { user.membership_status === 'member' ? 'default' : 'secondary' } className = { user.membership_status === 'member' ? 'bg-emerald-500' : '' } >
                            { user.membership_status }
                            </Badge>
                            </div>
                            </CommandItem>
                                                                                ))
}
</CommandGroup>
    </CommandList>
    </Command>
    </PopoverContent>
    </Popover>
    < FormMessage />
    </FormItem>
                                                    )}
                                                />
                                            )}
</div>
                                    )}

{/* 2. Time Slot */ }
<FormField
    control={ form.control }
name = "schedule_type"
render = {({ field }) => (
    <FormItem>
    <FormLabel className= "text-base font-semibold" > Time Slot </FormLabel>
        < FormControl >
        <RadioGroup
                    onValueChange={ field.onChange }
defaultValue = { field.value }
className = "grid grid-cols-2 gap-4"
    >
    <FormItem>
    <FormControl>
    <RadioGroupItem value="day" className = "peer sr-only" />
        </FormControl>
        < FormLabel className = "gap-0 flex flex-col items-center justify-between rounded-xl border border-gray-200 bg-white p-0 hover:bg-gray-50 peer-data-[state=checked]:border-none peer-data-[state=checked]:ring-2 peer-data-[state=checked]:ring-emerald-500 peer-data-[state=checked]:bg-emerald-50 cursor-pointer shadow-sm transition-all h-32 justify-center" >
            <Sun className={ cn("mb-2 h-6 w-6", field.value === 'day' ? "text-orange-500" : "text-gray-400") } />
                < span className = "font-bold text-base text-gray-900" > Day </span>
                    < span className = "text-xs text-gray-500 mt-1" > 6:00 AM - 6:00 PM </span>
                        < span className = { cn("text-base font-bold mt-1", field.value === 'day' ? "text-emerald-600" : "text-emerald-600") } >₱{ getRateForSlot('day').toFixed(2) } </span>
                            </FormLabel>
                            </FormItem>
                            < FormItem >
                            <FormControl>
                            <RadioGroupItem value="night" className = "peer sr-only" />
                                </FormControl>
                                < FormLabel className = "gap-0 flex flex-col items-center justify-between rounded-xl border border-gray-200 bg-white p-0 hover:bg-gray-50 peer-data-[state=checked]:border-none peer-data-[state=checked]:ring-2 peer-data-[state=checked]:ring-emerald-500 peer-data-[state=checked]:bg-emerald-50 cursor-pointer shadow-sm transition-all h-32 justify-center" >
                                    <Moon className={ cn("mb-2 h-6 w-6", field.value === 'night' ? "text-indigo-500" : "text-gray-400") } />
                                        < span className = "font-bold text-base text-gray-900" > Night </span>
                                            < span className = "text-xs text-gray-500 mt-1" > 6:00 PM - 10:00 PM </span>
                                                < span className = { cn("text-base font-bold mt-1", field.value === 'night' ? "text-emerald-600" : "text-emerald-600") } >₱{ getRateForSlot('night').toFixed(2) } </span>
                                                    </FormLabel>
                                                    </FormItem>
                                                    </RadioGroup>
                                                    </FormControl>
                                                    < FormMessage />
                                                    </FormItem>
    )}
/>

{/* Category Selection */ }
<FormField
    control={ form.control }
name = "category"
render = {({ field }) => (
    <FormItem className= "space-y-3" >
    <FormLabel className="text-base font-semibold" > Category </FormLabel>
        < FormControl >
        <RadioGroup
                    onValueChange={
    (val) => {
        field.onChange(val)
        form.setValue('priest_count', 0)
    }
}
defaultValue = { field.value }
className = "grid grid-cols-2 gap-4"
    >
    <FormItem>
    <FormControl>
    <RadioGroupItem value="single" className = "peer sr-only" />
        </FormControl>
        < FormLabel className = "gap-0 flex flex-col items-center justify-between rounded-xl border border-gray-200 bg-white p-0 hover:bg-gray-50 peer-data-[state=checked]:border-none peer-data-[state=checked]:ring-2 peer-data-[state=checked]:ring-emerald-500 peer-data-[state=checked]:bg-emerald-50 cursor-pointer shadow-sm transition-all h-28 justify-center" >
            <User className={ cn("mb-2 h-6 w-6", field.value === 'single' ? "text-emerald-600" : "text-gray-400") } />
                < span className = "font-bold text-base text-gray-900" > Single </span>
                    < span className = "text-xs text-gray-500 mt-1 text-center" > Picker split by 2 </span>
                        </FormLabel>
                        </FormItem>
                        < FormItem >
                        <FormControl>
                        <RadioGroupItem value="double" className = "peer sr-only" />
                            </FormControl>
                            < FormLabel className = "gap-0 flex flex-col items-center justify-between rounded-xl border border-gray-200 bg-white p-0 hover:bg-gray-50 peer-data-[state=checked]:border-none peer-data-[state=checked]:ring-2 peer-data-[state=checked]:ring-emerald-500 peer-data-[state=checked]:bg-emerald-50 cursor-pointer shadow-sm transition-all h-28 justify-center" >
                                <Users className={ cn("mb-2 h-6 w-6", field.value === 'double' ? "text-emerald-600" : "text-gray-400") } />
                                    < span className = "font-bold text-base text-gray-900" > Double </span>
                                        < span className = "text-xs text-gray-500 mt-1 text-center" > Picker split by 4 </span>
                                            </FormLabel>
                                            </FormItem>
                                            </RadioGroup>
                                            </FormControl>
                                            < FormMessage />
                                            </FormItem>
    )}
/>

{/* Priest Option */ }
<FormField
    control={ form.control }
name = "priest_count"
render = {({ field }) => {
    const category = form.watch('category');
    const maxPriest = category === 'double' ? 3 : 1;

    return (
        <FormItem className= "space-y-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm" >
        <div className="flex flex-row items-center justify-between" >
            <div className="space-y-0.5" >
                <FormLabel className="text-base font-semibold" > With Priest </FormLabel>
                    < div className = "text-sm text-muted-foreground" >
                        Are you playing with a priest ?
                            </div>
                            </div>
                            < FormControl >
                            <Switch
                            checked={ field.value > 0 }
    onCheckedChange = {(checked) => {
        field.onChange(checked ? 1 : 0);
    }
}
                        />
    </FormControl>
    </div>
{
    field.value > 0 && (
        <div className="flex items-center gap-4 pt-2 border-t" >
            <FormLabel className="whitespace-nowrap" > Priest Quantity(Max: { maxPriest }) </FormLabel>
                < FormControl >
                <Input
                                type="number"
    min = { 1}
    max = { maxPriest }
    value = { field.value }
    onChange = {(e) => {
        let val = parseInt(e.target.value);
        if (isNaN(val)) val = 1;
        if (val > maxPriest) val = maxPriest;
        if (val < 1) val = 1;
        field.onChange(val);
    }
}
className = "w-24"
    />
    </FormControl>
    < FormMessage />
    </div>
                )}
</FormItem>
        );
    }}
/>

{/* 3. Number of Games */ }
<FormField
    control={ form.control }
name = "games_count"
render = {({ field }) => (
    <FormItem className= "space-y-3" >
    <FormLabel className="text-base font-semibold" > Number of Games </FormLabel>
        < FormControl >
        <div className="flex gap-4" >
        {
            [1, 2, 3, 4].map((count) => (
                <Button
                    key= { count }
                    type = "button"
                    variant = "ghost"
                    className = {
                    cn(
                        "flex-1 h-14 text-xl font-bold rounded-xl border border-gray-200 shadow-sm hover:bg-emerald-50 hover:text-emerald-600",
                        field.value === count
                            ? "bg-emerald-500 text-white hover:bg-emerald-600 hover:text-white border-transparent shadow-md"
                            : "bg-white text-gray-900"
                    )
        }
onClick = {() => field.onChange(count)}
                                                                >
    { count }
    </Button>
                                                            ))}
</div>
    </FormControl>

{/* Picker Selection per Game */ }
<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2" >
{
    Array.from({ length: field.value }).map((_, index) => (
        <FormField
            key= { index }
            control = { form.control }
            name = {`picker_selection.${index}`}
render = {({ field: pickerField }) => (
    <FormItem className= "flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4" >
    <FormControl>
    <Checkbox
                            checked={ pickerField.value }
onCheckedChange = { pickerField.onChange }
    />
    </FormControl>
    < div className = "space-y-1 leading-none" >
        <FormLabel>
        Game { index + 1 }: With Picker(+₱{ pickerFee.toFixed(2) })
            </FormLabel>
            </div>
            </FormItem>
            )}
        />
    ))}
</div>
    < FormMessage />
    </FormItem>
                                            )}
                                        />

{/* Optional Trainer Section */ }
<FormField
                                            control={ form.control }
name = "with_trainer"
render = {({ field }) => (
    <FormItem className= "flex items-center space-x-3 space-y-0 bg-slate-50 p-4 rounded-xl border border-slate-100" >
    <FormControl>
    <Switch
                                                            checked={ field.value }
onCheckedChange = { field.onChange }
    />
    </FormControl>
    < div >
    <FormLabel className="font-medium text-gray-900" > Include Trainer(+₱{ settings.fee_trainer }) </FormLabel>
        </div>
        </FormItem>
                                            )}
                                        />


{/* 4. Payment Method */ }
<FormField
                                        control={ form.control }
name = "payment_method"
render = {({ field }) => (
    <FormItem>
    <FormLabel className= "text-base font-semibold" > Payment Method </FormLabel>
        < FormControl >
        <RadioGroup
                                                        onValueChange={ field.onChange }
defaultValue = { field.value }
className = "grid grid-cols-2 gap-4"
    >
    <FormItem>
    <FormControl>
    <RadioGroupItem value="cash" className = "peer sr-only" />
        </FormControl>
        < FormLabel className = "flex flex-col items-center justify-between rounded-xl border border-gray-200 bg-white p-6 hover:bg-gray-50 peer-data-[state=checked]:border-none peer-data-[state=checked]:ring-2 peer-data-[state=checked]:ring-emerald-500 peer-data-[state=checked]:bg-emerald-50 cursor-pointer shadow-sm transition-all h-32 justify-center" >
            <Banknote className="mb-2 h-8 w-8 text-emerald-600" />
                <span className="font-bold text-gray-900" > Cash </span>
                    < span className = "text-sm text-gray-500" > Pay at counter </span>
                        </FormLabel>
                        </FormItem>
                        < FormItem >
                        <FormControl>
                        <RadioGroupItem value="gcash" className = "peer sr-only" />
                            </FormControl>
                            < FormLabel className = "flex flex-col items-center justify-between rounded-xl border border-gray-200 bg-white p-6 hover:bg-gray-50 peer-data-[state=checked]:border-none peer-data-[state=checked]:ring-2 peer-data-[state=checked]:ring-emerald-500 peer-data-[state=checked]:bg-emerald-50 cursor-pointer shadow-sm transition-all h-32 justify-center" >
                                <CreditCard className="mb-2 h-8 w-8 text-blue-500" />
                                    <span className="font-bold text-gray-900" > GCash </span>
                                        < span className = "text-sm text-gray-500" > Pay online </span>
                                            </FormLabel>
                                            </FormItem>
                                            </RadioGroup>
                                            </FormControl>
                                            < FormMessage />
                                            </FormItem>
                                        )}
                                    />

{/* Summary Section */ }
<div className="pt-8 border-t border-gray-100 space-y-4" >
    <div className="flex justify-between items-center text-gray-600" >
        <span className="text-lg" > Subtotal({ values.games_count } games) </span>
            < span className = "text-lg font-medium" >₱{ subtotal.toFixed(2) } </span>
                </div>

{
    false && (
        <div className="flex justify-between items-center text-emerald-600" >
            <div className="flex items-center gap-2" >
                <span className="text-lg" > Member Discount </span>
                    < Badge className = "bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-2 py-0.5 text-xs" > -{(0 * 100).toFixed(0)
}% </Badge>
    </div>
    < span className = "text-lg font-medium" > -₱{ (0).toFixed(2) } </span>
        </div>
                                        )}

<div className="flex justify-between items-center pt-2" >
    <span className="text-2xl font-bold text-gray-900" > Total </span>
        < span className = "text-2xl font-bold text-emerald-600" >₱{ total.toFixed(2) } </span>
            </div>

            < Button
type = "submit"
size = "lg"
className = "w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-lg h-14 rounded-xl shadow-lg shadow-emerald-200 mt-4"
    >
    Review Booking
        </Button>
        </div>

        </CardContent>
        </Card>
        </form>
        </Form>
        </div>
        </div>

{/* Confirmation Dialog */ }
<Dialog open={ showConfirmDialog } onOpenChange = { setShowConfirmDialog } >
    <DialogContent className="sm:max-w-[500px]" >
        <DialogHeader>
        <DialogTitle className="text-xl font-bold" > Confirm Your Booking </DialogTitle>
            <DialogDescription>
                            Please review your booking details before confirming.
                        </DialogDescription>
    </DialogHeader>

    < div className = "space-y-4 py-4" >
        {/* Customer Info */ }
        < div className = "bg-slate-50 rounded-lg p-4 space-y-2" >
            <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider" > Customer </h4>
                < div className = "flex items-center justify-between" >
                    <span className="font-medium text-gray-900" >
                        { isGuest? "Guest (Walk-in)": selectedUser?.name || "Not selected" }
                        </span>
{
    !isGuest && selectedUser && (
        <Badge variant={ selectedUser.membership_status === 'member' ? 'default' : 'secondary' } className = { selectedUser.membership_status === 'member' ? 'bg-emerald-500' : '' } >
            { selectedUser.membership_status }
            </Badge>
                                )
}
</div>
    </div>

{/* Booking Details */ }
<div className="bg-slate-50 rounded-lg p-4 space-y-3" >
    <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider" > Booking Details </h4>

        < div className = "grid grid-cols-2 gap-3 text-sm" >
            <div>
            <span className="text-gray-500" > Date </span>
                < p className = "font-medium text-gray-900" > { values.booking_date ? format(values.booking_date, "MMMM d, yyyy") : "-" } </p>
                    </div>
                    < div >
                    <span className="text-gray-500" > Time Slot </span>
                        < p className = "font-medium text-gray-900 flex items-center gap-1" >
                            {
                                values.schedule_type === "day" ? (
                                    <><Sun className= "h-4 w-4 text-orange-500" /> Day(6AM - 6PM) </>
                                        ) : (
                                        <><Moon className="h-4 w-4 text-indigo-500" /> Night(6PM - 10PM) </>
                                    )}
</p>
    </div>
    < div >
    <span className="text-gray-500" > Number of Games </span>
        < p className = "font-medium text-gray-900" > { values.games_count } { values.games_count === 1 ? "game" : "games" } </p>
            </div>
            < div >
            <span className="text-gray-500" > Category </span>
                < p className = "font-medium text-gray-900 capitalize" > { values.category } </p>
                    </div>
                    < div >
                    <span className="text-gray-500" > With Trainer </span>
                        < p className = "font-medium text-gray-900" > { values.with_trainer ? "Yes" : "No" } </p>
                            </div>
                            </div>
                            </div>

{/* Payment Info */ }
<div className="bg-slate-50 rounded-lg p-4 space-y-3" >
    <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider" > Payment </h4>

        < div className = "flex items-center gap-2" >
            {
                values.payment_method === "cash" ? (
                    <><Banknote className= "h-5 w-5 text-emerald-600" /> <span className="font-medium"> Cash < /span></ >
                                ) : (
                        <><CreditCard className="h-5 w-5 text-blue-500" /> <span className="font-medium" > GCash < /span></ >
                                )}
</div>

    < div className = "border-t border-gray-200 pt-3 space-y-2" >
        <div className="flex justify-between text-sm" >
            <span className="text-gray-500" > Subtotal({ values.games_count } games × ₱{ courtRate.toFixed(2) }) </span>
                < span className = "font-medium" >₱{ (courtRate * values.games_count).toFixed(2) } </span>
                    </div>
{
    values.with_trainer && (
        <div className="flex justify-between text-sm" >
            <span className="text-gray-500" > Trainer({ values.games_count } games × ₱{ trainerFee.toFixed(2) }) </span>
                < span className = "font-medium" >₱{ (trainerFee * values.games_count).toFixed(2) } </span>
                    </div>
                                )
}
{
    activePickerCount > 0 && (
        <div className="flex justify-between text-sm" >
            <span className="text-gray-500" > Picker({ activePickerCount } games × ₱{ pickerFee.toFixed(2) }) </span>
                < span className = "font-medium" >₱{ totalPickerFee.toFixed(2) } </span>
                    </div>
    )
}
<div className="flex justify-between pt-2 border-t border-gray-200" >
    <span className="text-lg font-bold text-gray-900" > Total </span>
        < span className = "text-lg font-bold text-emerald-600" >₱{ total.toFixed(2) } </span>
            </div>
            </div>
            </div>
            </div>

            < DialogFooter className = "gap-2 sm:gap-0" >
                <Button
type = "button"
variant = "outline"
onClick = {() => setShowConfirmDialog(false)}
disabled = { isSubmitting }
    >
    Cancel
    </Button>
    < Button
type = "button"
onClick = { onConfirmBooking }
disabled = { isSubmitting }
className = "bg-emerald-500 hover:bg-emerald-600"
    >
    { isSubmitting? "Processing...": `Confirm Booking - ₱${total.toFixed(2)}` }
    </Button>
    </DialogFooter>
    </DialogContent>
    </Dialog>
    </AuthenticatedLayout>
    )
}
