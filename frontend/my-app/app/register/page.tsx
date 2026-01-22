"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, Loader2, User, Building2, GraduationCap, MapPin, Mail, Lock } from "lucide-react"
import Navbar from "../components/Navbar/page"

export default function Register() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")

    const [preFilledData, setPreFilledData] = useState({
        email: "",
        organization: "",
        googleId: ""
    })

    const [formData, setFormData] = useState({
        fullName: "",
        username: "",
        levelORyear: "",
        Department: ""
    })

    useEffect(() => {
        // Attempt to load pre-filled data if available (fallback logic since user said it's done)
        // We look for 'user_data' or individual items, depending on how previous flow stores it.
        // Assuming 'user_data' object or individual keys.
        const userDataStr = localStorage.getItem('user_data')
        const emailFormat = localStorage.getItem('selectedEmailFormat')
        const orgName = localStorage.getItem('selectedOrganization')

        if (userDataStr) {
            try {
                const userData = JSON.parse(userDataStr)
                setPreFilledData({
                    email: userData.email,
                    organization: userData.Organization || orgName || "",
                    googleId: userData.googleId
                })
                // Pre-fill username if empty
                if (userData.email && !formData.username) {
                    setFormData(prev => ({ ...prev, username: userData.email.split('@')[0] }))
                }
                setFormData(prev => ({ ...prev, fullName: userData.fullName || "" }))
            } catch (e) {
                console.error("Error parsing user data", e)
            }
        } else {
            // Fallback to individual items if userData object isn't there
            setPreFilledData({
                email: emailFormat || "",
                organization: orgName || "",
                googleId: ""
            })
            if (emailFormat && !formData.username) {
                setFormData(prev => ({ ...prev, username: emailFormat.split('@')[0] }))
            }
        }
    }, [])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setErrorMessage("")

        try {
            const response = await fetch("http://localhost:9000/api/v1/user/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                // Credentials include to send the cookies (accessToken) from GoogleAuth
                credentials: "include",
                body: JSON.stringify(formData),
            })

            const data = await response.json()

            if (response.ok) {
                router.push("/dashboard") // Or wherever the home/dashboard is
            } else {
                setErrorMessage(data.message || "Registration failed")
            }
        } catch (error) {
            setErrorMessage("Something went wrong. Please try again.")
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-indigo-500/30">
            {/* Background Gradients */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-900/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-900/20 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10">

                <main className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4 py-12">
                    {/* <img src="/societea.png" alt="SocieTea Logo" className="h-25 w-auto mb-15 drop-shadow-lg" /> */}
                    <div className="w-full max-w-2xl animate-slide-up">

                        <div className="text-center mb-10">
                            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-white tracking-tight">
                                Complete Your Profile
                            </h1>
                            <p className="text-gray-400 text-lg">
                                Just a few more details to get you started with {preFilledData.organization || "SocieTea"}.
                            </p>
                        </div>

                        <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden">
                            {/* Decorative sheen */}
                            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                            <form onSubmit={handleSubmit} className="space-y-6">

                                {/* Read-Only Section */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-black/20 rounded-2xl border border-white/5">
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                            Organization
                                        </label>
                                        <div className="flex items-center gap-3 text-gray-300">
                                            <Building2 className="h-5 w-5 text-indigo-400" />
                                            <span className="font-medium truncate">{preFilledData.organization || "Not Selected"}</span>
                                            <Lock className="h-3 w-3 text-gray-600 ml-auto" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                            Email Address
                                        </label>
                                        <div className="flex items-center gap-3 text-gray-300">
                                            <Mail className="h-5 w-5 text-indigo-400" />
                                            <span className="font-medium truncate">{preFilledData.email || "Signed in via Google"}</span>
                                            <Lock className="h-3 w-3 text-gray-600 ml-auto" />
                                        </div>
                                    </div>
                                </div>

                                {/* Input Fields */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label htmlFor="fullName" className="text-sm font-medium text-gray-300 ml-1">
                                            Full Name
                                        </label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <User className="h-5 w-5 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
                                            </div>
                                            <input
                                                type="text"
                                                id="fullName"
                                                name="fullName"
                                                value={formData.fullName}
                                                onChange={handleChange}
                                                className="block w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all hover:bg-white/[0.08]"
                                                placeholder="John Doe"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="username" className="text-sm font-medium text-gray-300 ml-1">
                                            Username
                                        </label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <span className="text-gray-500 font-mono text-lg group-focus-within:text-indigo-400">@</span>
                                            </div>
                                            <input
                                                type="text"
                                                id="username"
                                                name="username"
                                                value={formData.username}
                                                onChange={handleChange}
                                                className="block w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all hover:bg-white/[0.08]"
                                                placeholder="username"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="Department" className="text-sm font-medium text-gray-300 ml-1">
                                            Department
                                        </label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <GraduationCap className="h-5 w-5 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
                                            </div>
                                            <input
                                                type="text"
                                                id="Department"
                                                name="Department"
                                                value={formData.Department}
                                                onChange={handleChange}
                                                className="block w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all hover:bg-white/[0.08]"
                                                placeholder="e.g. Computer Science"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="levelORyear" className="text-sm font-medium text-gray-300 ml-1">
                                            Level / Year
                                        </label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <MapPin className="h-5 w-5 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
                                            </div>
                                            <input
                                                type="text"
                                                id="levelORyear"
                                                name="levelORyear"
                                                value={formData.levelORyear}
                                                onChange={handleChange}
                                                className="block w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all hover:bg-white/[0.08]"
                                                placeholder="e.g. 2nd Year / Sophomore"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                {errorMessage && (
                                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                                        {errorMessage}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full mt-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/25 border border-white/10 transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                                >
                                    {isLoading ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : (
                                        <>
                                            Complete Registration
                                            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}
