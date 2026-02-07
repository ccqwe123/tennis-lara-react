import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout"
import { Head, router, useForm } from "@inertiajs/react"
import { useState, useEffect } from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Filter, Loader2, Plus, Search, Trash2 } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/Components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card"
import { Input } from "@/Components/ui/input"
import { Badge } from "@/Components/ui/badge"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/Components/ui/dialog"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/Components/ui/alert-dialog"
import { Label } from "@/Components/ui/label"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/Components/ui/popover"
import { Calendar } from "@/Components/ui/calendar"
import { toast } from "sonner"
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/Components/ui/pagination"

declare var route: any;

interface Expense {
    id: number
    date: string
    item: string
    amount: number
}

interface DailyExpenseSummary {
    date: string
    count: number
    total: number
}

interface PaginatedDailyExpenses {
    data: DailyExpenseSummary[]
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
    auth: any
    mode: 'summary' | 'detail'
    expenses?: Expense[] // For detail view
    dailyExpenses?: PaginatedDailyExpenses // For summary view
    date?: string // For detail view
    total?: number // For detail view
}

export default function ExpensesIndex({ auth, mode, expenses, dailyExpenses, date, total }: Props) {
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null)
    const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null)

    // Form for Create
    const { data: createData, setData: setCreateData, post: postCreate, processing: processingCreate, reset: resetCreate, errors: errorsCreate } = useForm({
        date: date ? date : format(new Date(), 'yyyy-MM-dd'),
        item: '',
        amount: '',
    })

    // Form for Edit
    const { data: editData, setData: setEditData, put: putEdit, processing: processingEdit, reset: resetEdit, errors: errorsEdit } = useForm({
        date: '',
        item: '',
        amount: '',
    })

    // Update Create Form Date when prop changes
    useEffect(() => {
        if (date) {
            setCreateData('date', date)
        }
    }, [date])

    const submitCreate = (e: React.FormEvent) => {
        e.preventDefault()
        postCreate(route('expenses.store'), {
            onSuccess: () => {
                setIsCreateOpen(false)
                resetCreate('item', 'amount')
                toast("Expense added successfully.")
            },
        })
    }

    const openEdit = (expense: Expense) => {
        setExpenseToEdit(expense)
        setEditData({
            date: expense.date,
            item: expense.item,
            amount: expense.amount.toString(),
        })
        setIsEditOpen(true)
    }

    const submitEdit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!expenseToEdit) return

        putEdit(route('expenses.update', expenseToEdit.id), {
            onSuccess: () => {
                setIsEditOpen(false)
                setExpenseToEdit(null)
                toast("Expense updated successfully.")
            },
        })
    }

    const confirmDelete = () => {
        if (!expenseToDelete) return
        router.delete(route('expenses.destroy', expenseToDelete.id), {
            onSuccess: () => {
                setExpenseToDelete(null)
                toast("Expense deleted successfully.")
            }
        })
    }

    const goToDetail = (dateStr: string) => {
        router.get(route('expenses.index'), { date: dateStr })
    }

    const backToSummary = () => {
        router.get(route('expenses.index'))
    }

    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Expenses</h2>}>
            <Head title="Expenses" />

            <div className="py-6 px-4 sm:px-6 lg:px-8 space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-2">
                        {mode === 'detail' && (
                            <Button variant="outline" onClick={backToSummary}>
                                &larr; Back to Summary
                            </Button>
                        )}
                        <h3 className="text-lg font-medium">
                            {mode === 'summary' ? 'Daily Expenses' : `Expenses for ${format(new Date(date!), 'MMM d, yyyy')}`}
                        </h3>
                    </div>

                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-emerald-600 hover:bg-emerald-700">
                                <Plus className="w-4 h-4 mr-2" /> Add Expense
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add New Expense</DialogTitle>
                                <DialogDescription>
                                    Record a new expense.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={submitCreate} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="create-date">Date</Label>
                                    <Input
                                        id="create-date"
                                        type="date"
                                        value={createData.date}
                                        onChange={(e) => setCreateData('date', e.target.value)}
                                        required
                                    />
                                    {errorsCreate.date && <span className="text-sm text-red-500">{errorsCreate.date}</span>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="create-item">Item / Description</Label>
                                    <Input
                                        id="create-item"
                                        value={createData.item}
                                        onChange={(e) => setCreateData('item', e.target.value)}
                                        placeholder="e.g., Water Bill, Tennis Balls"
                                        required
                                    />
                                    {errorsCreate.item && <span className="text-sm text-red-500">{errorsCreate.item}</span>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="create-amount">Amount (₱)</Label>
                                    <Input
                                        id="create-amount"
                                        type="number"
                                        step="0.01"
                                        value={createData.amount}
                                        onChange={(e) => setCreateData('amount', e.target.value)}
                                        placeholder="0.00"
                                        required
                                    />
                                    {errorsCreate.amount && <span className="text-sm text-red-500">{errorsCreate.amount}</span>}
                                </div>
                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                                    <Button type="submit" disabled={processingCreate} className="bg-emerald-600 hover:bg-emerald-700">
                                        {processingCreate ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                        Save Expense
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <Card>
                    <div className="rounded-md border">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b">
                                {mode === 'summary' ? (
                                    <tr>
                                        <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Date</th>
                                        <th className="h-10 px-4 text-center align-middle font-medium text-muted-foreground">Items</th>
                                        <th className="h-10 px-4 text-right align-middle font-medium text-muted-foreground">Total Amount</th>
                                        <th className="h-10 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
                                    </tr>
                                ) : (
                                    <tr>
                                        <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground w-1/2">Item</th>
                                        <th className="h-10 px-4 text-right align-middle font-medium text-muted-foreground">Amount</th>
                                        <th className="h-10 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
                                    </tr>
                                )}
                            </thead>
                            <tbody>
                                {mode === 'summary' && dailyExpenses ? (
                                    dailyExpenses.data.length > 0 ? (
                                        dailyExpenses.data.map((summary) => (
                                            <tr key={summary.date} className="border-b transition-colors hover:bg-muted/50 cursor-pointer" onClick={() => goToDetail(summary.date)}>
                                                <td className="p-4 align-middle font-medium">{format(new Date(summary.date), 'MMM d, yyyy')}</td>
                                                <td className="p-4 align-middle text-center">{summary.count}</td>
                                                <td className="p-4 align-middle text-right font-mono text-emerald-600 font-bold">₱{Number(summary.total).toLocaleString()}</td>
                                                <td className="p-4 align-middle text-right">
                                                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); goToDetail(summary.date); }}>
                                                        Manage
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="p-8 text-center text-gray-500">No expenses recorded yet.</td>
                                        </tr>
                                    )
                                ) : mode === 'detail' && expenses ? (
                                    expenses.length > 0 ? (
                                        expenses.map((expense) => (
                                            <tr key={expense.id} className="border-b transition-colors hover:bg-muted/50">
                                                <td className="p-4 align-middle font-medium">{expense.item}</td>
                                                <td className="p-4 align-middle text-right font-mono">₱{Number(expense.amount).toLocaleString()}</td>
                                                <td className="p-4 align-middle text-right flex justify-end gap-2">
                                                    <Button variant="ghost" size="icon" onClick={() => openEdit(expense)}>
                                                        <span className="sr-only">Edit</span>
                                                        {/* Edit Icon directly or lucide */}
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                        onClick={() => setExpenseToDelete(expense)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={3} className="p-8 text-center text-gray-500">No items found for this date.</td>
                                        </tr>
                                    )
                                ) : null}
                            </tbody>
                            {mode === 'detail' && expenses && expenses.length > 0 && (
                                <tfoot>
                                    <tr className="bg-gray-50 font-bold">
                                        <td className="p-4 align-middle">Total</td>
                                        <td className="p-4 align-middle text-right font-mono">₱{Number(total).toLocaleString()}</td>
                                        <td></td>
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    </div>
                    {mode === 'summary' && dailyExpenses && dailyExpenses.last_page > 1 && (
                        <div className="flex items-center justify-between p-4 border-t">
                            <p className="text-sm text-gray-600">
                                Showing {(dailyExpenses.current_page - 1) * dailyExpenses.per_page + 1} to{" "}
                                {Math.min(dailyExpenses.current_page * dailyExpenses.per_page, dailyExpenses.total)} of{" "}
                                {dailyExpenses.total} results
                            </p>
                            <Pagination className="w-auto mx-0">
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            href={dailyExpenses.links[0].url || '#'}
                                            isActive={!dailyExpenses.links[0].url}
                                            className={!dailyExpenses.links[0].url ? 'pointer-events-none opacity-50' : ''}
                                        />
                                    </PaginationItem>

                                    {dailyExpenses.links.slice(1, -1).map((link, i) => {
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
                                            href={dailyExpenses.links[dailyExpenses.links.length - 1].url || '#'}
                                            isActive={!dailyExpenses.links[dailyExpenses.links.length - 1].url}
                                            className={!dailyExpenses.links[dailyExpenses.links.length - 1].url ? 'pointer-events-none opacity-50' : ''}
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>
                    )}
                </Card>
            </div>

            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Expense</DialogTitle>
                        <DialogDescription>
                            Update expense details.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={submitEdit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-date">Date</Label>
                            <Input
                                id="edit-date"
                                type="date"
                                value={editData.date}
                                onChange={(e) => setEditData('date', e.target.value)}
                                required
                            />
                            {errorsEdit.date && <span className="text-sm text-red-500">{errorsEdit.date}</span>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-item">Item / Description</Label>
                            <Input
                                id="edit-item"
                                value={editData.item}
                                onChange={(e) => setEditData('item', e.target.value)}
                                required
                            />
                            {errorsEdit.item && <span className="text-sm text-red-500">{errorsEdit.item}</span>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-amount">Amount (₱)</Label>
                            <Input
                                id="edit-amount"
                                type="number"
                                step="0.01"
                                value={editData.amount}
                                onChange={(e) => setEditData('amount', e.target.value)}
                                required
                            />
                            {errorsEdit.amount && <span className="text-sm text-red-500">{errorsEdit.amount}</span>}
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={processingEdit} className="bg-emerald-600 hover:bg-emerald-700">
                                {processingEdit ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                Update Expense
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!expenseToDelete} onOpenChange={(open) => !open && setExpenseToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Expense?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete <span className="font-semibold">{expenseToDelete?.item}</span>? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={confirmDelete}>
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AuthenticatedLayout>
    )
}
