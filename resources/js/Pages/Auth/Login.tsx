import { useEffect, FormEvent, useState } from "react"
import GuestLayout from "@/Layouts/GuestLayout"
import { Head, Link, useForm } from "@inertiajs/react"
import { cn } from "@/lib/utils"
import { Button } from "@/Components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card"
import { Input } from "@/Components/ui/input"
import { Label } from "@/Components/ui/label"
import { Checkbox } from "@/Components/ui/checkbox"
import { Alert, AlertDescription } from "@/Components/ui/alert"
import { CheckCircle2, Eye, Loader2, EyeOff } from "lucide-react"

interface LoginProps {
    status?: string
    canResetPassword: boolean
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const [showPassword, setShowPassword] = useState(false)
    const { data, setData, post, processing, errors, reset } = useForm({
        username: "",
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
                            <Label htmlFor="email">Username</Label>
                            <Input
                                id="email"
                                type="text"
                                placeholder="Enter your username"
                                value={data.username}
                                onChange={(e) => setData("username", e.target.value)}
                                required
                                autoComplete="username"
                                autoFocus
                                className={cn(errors.username && "border-red-500", "p-5")}
                            />
                            {errors.username && (
                                <p className="text-sm text-red-500">{errors.username}</p>
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
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={data.password}
                                    onChange={(e) => setData("password", e.target.value)}
                                    autoComplete="current-password"
                                    className={cn(errors.password && "border-red-500", "p-5")}
                                    required
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-0 top-0 h-full px-3 py-2 border-0  bg-transparent"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4 text-gray-500" />
                                    ) : (
                                        <Eye className="h-4 w-4 text-gray-500" />
                                    )}
                                </Button>
                            </div>
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

                        <Button type="submit" className="w-full p-5" disabled={processing}>
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
                                onClick={() => { setData("username", "admin"); setData("password", "password") }}
                                className="rounded bg-red-500/10 px-2 py-1 text-red-500 hover:bg-red-500/20"
                            >
                                Admin
                            </button>
                            <button
                                type="button"
                                onClick={() => { setData("username", "staff"); setData("password", "password") }}
                                className="rounded bg-blue-500/10 px-2 py-1 text-blue-500 hover:bg-blue-500/20"
                            >
                                Staff
                            </button>
                            <button
                                type="button"
                                onClick={() => { setData("username", "user"); setData("password", "password") }}
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
