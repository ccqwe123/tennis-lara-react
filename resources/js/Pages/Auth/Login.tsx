import { useEffect, FormEvent } from "react"
import GuestLayout from "@/Layouts/GuestLayout"
import { Head, Link, useForm } from "@inertiajs/react"
import { cn } from "@/lib/utils"
import { Button } from "@/Components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/Components/ui/checkbox"
import { Alert, AlertDescription } from "@/Components/ui/alert"
import { CheckCircle2, Loader2 } from "lucide-react"

interface LoginProps {
    status?: string
    canResetPassword: boolean
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: "",
        password: "",
        remember: false,
    })

    useEffect(() => {
        return () => {
            reset("password")
        }
    }, [])

    const submit = (e: FormEvent) => {
        e.preventDefault()
        post(route("login"))
    }

    return (
        <GuestLayout>
            <Head title="Log in" />

            <Card className="border-0 shadow-2xl">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
                    <CardDescription>
                        Enter your credentials to access your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {status && (
                        <Alert className="mb-4 border-green-500 bg-green-500/10">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <AlertDescription className="text-green-500">
                                {status}
                            </AlertDescription>
                        </Alert>
                    )}

                    <form onSubmit={submit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="m@example.com"
                                value={data.email}
                                onChange={(e) => setData("email", e.target.value)}
                                required
                                autoComplete="username"
                                autoFocus
                                className={cn(errors.email && "border-red-500")}
                            />
                            {errors.email && (
                                <p className="text-sm text-red-500">{errors.email}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Password</Label>
                                {canResetPassword && (
                                    <Link
                                        href={route("password.request")}
                                        className="text-sm text-muted-foreground hover:text-primary"
                                    >
                                        Forgot password?
                                    </Link>
                                )}
                            </div>
                            <Input
                                id="password"
                                type="password"
                                value={data.password}
                                onChange={(e) => setData("password", e.target.value)}
                                required
                                autoComplete="current-password"
                                className={cn(errors.password && "border-red-500")}
                            />
                            {errors.password && (
                                <p className="text-sm text-red-500">{errors.password}</p>
                            )}
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="remember"
                                checked={data.remember}
                                onCheckedChange={(checked) =>
                                    setData("remember", checked as boolean)
                                }
                            />
                            <Label htmlFor="remember" className="text-sm font-normal">
                                Remember me
                            </Label>
                        </div>

                        <Button type="submit" className="w-full" disabled={processing}>
                            {processing && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Sign in
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-sm text-muted-foreground">
                        Don't have an account?{" "}
                        <Link
                            href={route("register")}
                            className="font-medium text-primary hover:underline"
                        >
                            Sign up
                        </Link>
                    </div>

                    {/* Demo credentials */}
                    <div className="mt-6 rounded-lg border border-dashed p-4">
                        <p className="mb-2 text-center text-xs font-medium text-muted-foreground">
                            Demo Credentials (password: "password")
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <button
                                type="button"
                                onClick={() => setData("email", "admin@tennis.com")}
                                className="rounded bg-red-500/10 px-2 py-1 text-red-500 hover:bg-red-500/20"
                            >
                                Admin
                            </button>
                            <button
                                type="button"
                                onClick={() => setData("email", "staff@tennis.com")}
                                className="rounded bg-blue-500/10 px-2 py-1 text-blue-500 hover:bg-blue-500/20"
                            >
                                Staff
                            </button>
                            <button
                                type="button"
                                onClick={() => setData("email", "member@tennis.com")}
                                className="rounded bg-green-500/10 px-2 py-1 text-green-500 hover:bg-green-500/20"
                            >
                                Member
                            </button>
                            <button
                                type="button"
                                onClick={() => setData("email", "nonmember@tennis.com")}
                                className="rounded bg-gray-500/10 px-2 py-1 text-gray-500 hover:bg-gray-500/20"
                            >
                                Non-member
                            </button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </GuestLayout>
    )
}
