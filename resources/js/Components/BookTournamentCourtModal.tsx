import { useEffect, useRef, useState } from "react"
import { router } from "@inertiajs/react"
import { Search, Trophy } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/Components/ui/dialog"
import { Button } from "@/Components/ui/button"
import { Input } from "@/Components/ui/input"

interface Tournament {
    id: number
    name: string
    status: string
}

interface Props {
    open: boolean
    onClose: () => void
}

export function BookTournamentCourtModal({ open, onClose }: Props) {
    const [tournaments, setTournaments] = useState<Tournament[]>([])
    const [search, setSearch] = useState("")
    const [selected, setSelected] = useState<Tournament | null>(null)
    const [loading, setLoading] = useState(false)
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    const fetchTournaments = (q: string) => {
        setLoading(true)
        const url = q.trim()
            ? route("api.tournaments.active") + `?search=${encodeURIComponent(q)}`
            : route("api.tournaments.active")
        fetch(url)
            .then(r => r.json())
            .then(data => setTournaments(data))
            .finally(() => setLoading(false))
    }

    useEffect(() => {
        if (!open) return
        fetchTournaments("")
    }, [open])

    const handleSearch = (value: string) => {
        setSearch(value)
        if (debounceRef.current) clearTimeout(debounceRef.current)
        debounceRef.current = setTimeout(() => fetchTournaments(value), 300)
    }

    const handleNext = () => {
        if (!selected) return
        onClose()
        router.visit(route("tournaments.book-court", selected.id))
    }

    const handleClose = () => {
        setSearch("")
        setSelected(null)
        onClose()
    }

    return (
        <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose() }}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-emerald-600" />
                        Book Tournament Court
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search tournament..."
                            value={search}
                            onChange={e => handleSearch(e.target.value)}
                            className="pl-9 focus:ring-emerald-600 py-5"
                            autoFocus
                        />
                    </div>

                    <div className="rounded-md border divide-y">
                        {!search && (
                            <p className="px-4 py-2 text-xs text-gray-400">Showing top 5 latest tournaments</p>
                        )}
                        {loading ? (
                            <p className="text-center text-sm text-gray-400 py-8">Loading...</p>
                        ) : tournaments.length === 0 ? (
                            <p className="text-center text-sm text-gray-400 py-8">No active tournaments found.</p>
                        ) : (
                            tournaments.map(t => (
                                <button
                                    key={t.id}
                                    type="button"
                                    onClick={() => setSelected(t)}
                                    className={`w-full text-left px-4 py-3 text-sm transition-colors flex items-center justify-between ${selected?.id === t.id ? "bg-primary text-white font-medium hover:bg-green-700" : "text-gray-700 hover:bg-green-800 hover:text-white"}`}
                                >
                                    <span>{t.name}</span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${t.status === "open" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
                                        {t.status}
                                    </span>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                <DialogFooter className="gap-2">
                    <Button variant="outline" className="px-7 py-4" onClick={handleClose}>Cancel</Button>
                    <Button
                        className="bg-emerald-600 hover:bg-emerald-700 px-7 py-4"
                        disabled={!selected}
                        onClick={handleNext}
                    >
                        Next
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
