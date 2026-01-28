"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Navbar from "../components/Navbar/page"
import { Calendar, MapPin, Upload, Type, AlignLeft, Users } from "lucide-react"

interface Org {
    _id: string;
    name: string;
    admin: string[];
}

interface User {
    _id: string;
    Organization: string; // College Name
}

export default function EventCreationPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [user, setUser] = useState<User | null>(null)
    const [adminOrgs, setAdminOrgs] = useState<Org[]>([])

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        mode: "Offline",
        location: "",
        poster: "",
        orgId: "",
        startDate: "",
        endDate: ""
    })

    const [error, setError] = useState("")

    useEffect(() => {
        const loadData = async () => {
            try {
                // 1. Fetch User
                const userRes = await fetch("http://localhost:9000/api/v1/user/getUser", {
                    credentials: "include"
                })

                if (!userRes.ok) {
                    router.push("/googleAuth") // Redirect if not logged in
                    return
                }

                const userDataWrapper = await userRes.json()
                const currentUser = userDataWrapper.data?.user

                if (currentUser) {
                    setUser(currentUser)

                    // 2. Fetch All Orgs for the User's College
                    if (currentUser.Organization) {
                        const orgsRes = await fetch("http://localhost:9000/api/v1/college/get-college-orgs", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ college_nameid: currentUser.OrganizationId })
                        })
                        const orgsResult = await orgsRes.json()
                        const allOrgs: Org[] = orgsResult.data || []

                        // 3. Filter Orgs where user is Admin
                        const myAdminOrgs = allOrgs.filter(org => org.admin.includes(currentUser._id))
                        setAdminOrgs(myAdminOrgs)

                        if (myAdminOrgs.length > 0) {
                            setFormData(prev => ({ ...prev, orgId: myAdminOrgs[0]._id }))
                        }
                    }
                }
            } catch (err) {
                console.error("Error loading data:", err)
                setError("Failed to load user data")
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [router])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setSubmitting(true)

        if (!formData.orgId) {
            setError("You must select an organization")
            setSubmitting(false)
            return
        }

        try {
            const res = await fetch("http://localhost:9000/api/v1/events/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(formData)
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.message || "Failed to create event")
            }

            // Success - Redirect to event page (or org page for now)
            // router.push(`/event/${data.data._id}`) 
            router.push(`/org/${adminOrgs.find(o => o._id === formData.orgId)?.name}`) // Redirect to Org Page for now as Event Page might not exist fully or easy to verify there

        } catch (err: any) {
            setError(err.message)
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return <div className="min-h-screen bg-[#131515] flex items-center justify-center text-white">Loading...</div>
    }

    if (adminOrgs.length === 0) {
        return (
            <div className="min-h-screen bg-[#131515] text-white font-sans flex flex-col">
                <Navbar />
                <div className="flex-1 flex flex-col items-center justify-center p-4">
                    <div className="bg-[#1D1F21] p-8 rounded-3xl border border-white/10 max-w-md text-center">
                        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
                        <p className="text-gray-400 mb-6">You need to be an administrator of an organization to create events.</p>
                        <button
                            onClick={() => router.back()}
                            className="px-6 py-2 bg-indigo-600 rounded-full hover:bg-indigo-700 transition-colors"
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#131515] text-white font-sans selection:bg-indigo-500/30">
            <Navbar />

            <div className="max-w-4xl mx-auto px-4 py-12">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                        Create New Event
                    </h1>
                    <p className="text-gray-400 mt-2">Host an event for your organization</p>
                </div>

                <div className="bg-[#1D1F21] rounded-3xl border border-white/5 p-6 md:p-8 shadow-xl relative overflow-hidden">
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                        {/* Event Name */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                <Type className="w-4 h-4 text-indigo-400" />
                                Event Name
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="w-full bg-[#131515] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-gray-600"
                                placeholder="e.g. Annual Tech Symposium"
                            />
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                <AlignLeft className="w-4 h-4 text-indigo-400" />
                                Description
                            </label>
                            <textarea
                                required
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                className="w-full bg-[#131515] border border-white/10 rounded-xl px-4 py-3 h-32 focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-gray-600 resize-none"
                                placeholder="What is this event about?"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Organization Selector */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                    <Users className="w-4 h-4 text-indigo-400" />
                                    Organization
                                </label>
                                <select
                                    value={formData.orgId}
                                    onChange={e => setFormData({ ...formData, orgId: e.target.value })}
                                    className="w-full bg-[#131515] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors text-white appearance-none"
                                >
                                    {adminOrgs.map(org => (
                                        <option key={org._id} value={org._id}>{org.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Mode Selector */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-indigo-400" />
                                    Mode
                                </label>
                                <div className="flex bg-[#131515] p-1 rounded-xl border border-white/10">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, mode: "Offline" })}
                                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${formData.mode === "Offline" ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                                    >
                                        Offline
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, mode: "Online" })}
                                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${formData.mode === "Online" ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                                    >
                                        Online
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Start Date */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-indigo-400" />
                                    Start Date & Time
                                </label>
                                <input
                                    type="datetime-local"
                                    required
                                    value={formData.startDate}
                                    onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                                    className="w-full bg-[#131515] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors text-white scheme-dark"
                                />
                            </div>

                            {/* End Date */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-indigo-400" />
                                    End Date & Time
                                </label>
                                <input
                                    type="datetime-local"
                                    required
                                    value={formData.endDate}
                                    onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                                    className="w-full bg-[#131515] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors text-white scheme-dark"
                                />
                            </div>
                        </div>

                        {/* Location */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-indigo-400" />
                                {formData.mode === "Online" ? "Meeting Link / Platform" : "Venue Location"}
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.location}
                                onChange={e => setFormData({ ...formData, location: e.target.value })}
                                className="w-full bg-[#131515] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-gray-600"
                                placeholder={formData.mode === "Online" ? "e.g. Google Meet Link" : "e.g. Auditorium, Block A"}
                            />
                        </div>

                        {/* Poster URL */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                <Upload className="w-4 h-4 text-indigo-400" />
                                Poster Image URL
                            </label>
                            <input
                                type="url"
                                value={formData.poster}
                                onChange={e => setFormData({ ...formData, poster: e.target.value })}
                                className="w-full bg-[#131515] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-gray-600"
                                placeholder="https://..."
                            />
                            <p className="text-xs text-gray-500">Provide a direct link to your event poster (optional)</p>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-600/20 transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                        >
                            {submitting ? "Creating Event..." : "Create Event"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}