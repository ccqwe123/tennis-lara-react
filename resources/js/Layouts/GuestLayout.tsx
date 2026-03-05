import { ReactNode } from "react"
import { Link } from "@inertiajs/react"
import { GalleryVerticalEnd } from "lucide-react"

interface GuestLayoutProps {
    children: ReactNode
}

export default function GuestLayout({ children }: GuestLayoutProps) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
            {/* Background pattern */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMDIwMjAiIGZpbGwtb3BhY2l0eT0iMC40Ij48cGF0aCBkPSJNMzYgMzRoLTJ2LTRoMnY0em0wLTZ2LTRoLTJ2NGgyek0zNiAyMGgtMnYtNGgydjR6TTI0IDI0aDJ2NGgtMnYtNHptMCA2djRoMnYtNGgtMnptMC0xMmgydi00aC0ydjR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20" />

            {/* Logo */}
            <div className="flex items-center justify-center rounded-lg bg-transparent text-white">
                <img src="/images/logo.png" alt="Tennis Club" className="object-contain h-full w-50" />
            </div>

            {/* Content */}
            <div className="relative z-10 w-full max-w-md">{children}</div>

            {/* Footer */}
            <p className="relative z-10 mt-8 text-center text-sm text-slate-400">
                © {new Date().getFullYear()} Tuguegarao Tennis Club. All rights reserved.
            </p>
        </div>
    )
}
