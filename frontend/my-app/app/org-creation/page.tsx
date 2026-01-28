"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Building2, FileText, Image as ImageIcon, Loader2, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react"
import Navbar from "../components/Navbar/page"

export default function OrgCreation() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState(false)

    const [formData, setFormData] = useState({
        name: "",
        Description: "",
        profilePic: ""
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")
        setSuccess(false)

        try {
            const response = await fetch("http://localhost:9000/api/v1/orgs/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                // Important: Include credentials to send cookies (JWT) with the request
                credentials: "include",
                body: JSON.stringify(formData)
            })

            const data = await response.json()

            if (response.ok) {
                setSuccess(true)
                // Redirect after short delay
                setTimeout(() => {
                    if (data.data?._id) {
                        const nameSlug = encodeURIComponent(data.data.name || 'org');
                        router.push(`/org/${nameSlug}?id=${data.data._id}`)
                    } else {
                        router.push("/catalogue")
                    }
                }, 2000)
            } else {
                setError(data.message || "Something went wrong. Please try again.")
            }
        } catch (err) {
            setError("Failed to connect to the server. Please check your internet connection.")
            console.error(err)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-indigo-500/30 font-sans">
            <Navbar />

            {/* Background Gradients */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-900/10 rounded-full blur-[120px]" />
                <div className="absolute top-[40%] right-[-10%] w-[30%] h-[30%] bg-purple-900/10 rounded-full blur-[100px]" />
            </div>

            <main className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <button
                    onClick={() => router.back()}
                    className="flex items-center text-gray-400 hover:text-white transition-colors mb-8 group"
                >
                    <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Back
                </button>

                <div className="mb-10 animate-fade-in text-center sm:text-left">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-200 via-white to-indigo-200 tracking-tight">
                        Create Organization
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Start a new community in your college.
                    </p>
                </div>

                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-10 shadow-2xl animate-slide-up">
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-start gap-3 text-red-200">
                                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                                <p className="text-sm">{error}</p>
                            </div>
                        )}

                        {/* Success Message */}
                        {success && (
                            <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4 flex items-start gap-3 text-green-200">
                                <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
                                <div>
                                    <h3 className="font-semibold">Organization Created!</h3>
                                    <p className="text-sm opacity-90">Redirecting you...</p>
                                </div>
                            </div>
                        )}

                        {/* Name Field */}
                        <div className="space-y-2">
                            <label htmlFor="name" className="block text-sm font-medium text-gray-300 ml-1">
                                Organization Name <span className="text-red-400">*</span>
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Building2 className="h-5 w-5 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="e.g. Coding Club, Dance Society"
                                    className="block w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all sm:text-sm hover:bg-white/10"
                                />
                            </div>
                        </div>

                        {/* Description Field */}
                        <div className="space-y-2">
                            <label htmlFor="Description" className="block text-sm font-medium text-gray-300 ml-1">
                                Description <span className="text-red-400">*</span>
                            </label>
                            <div className="relative group">
                                <div className="absolute top-3.5 left-0 pl-4 pointer-events-none">
                                    <FileText className="h-5 w-5 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
                                </div>
                                <textarea
                                    id="Description"
                                    name="Description"
                                    required
                                    rows={4}
                                    value={formData.Description}
                                    onChange={handleChange}
                                    placeholder="Tell us about your organization..."
                                    className="block w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all sm:text-sm hover:bg-white/10 resize-none"
                                />
                            </div>
                        </div>

                        {/* Profile Pic Field */}
                        <div className="space-y-2">
                            <label htmlFor="profilePic" className="block text-sm font-medium text-gray-300 ml-1">
                                Profile Image URL
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <ImageIcon className="h-5 w-5 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    id="profilePic"
                                    name="profilePic"
                                    value={formData.profilePic}
                                    onChange={handleChange}
                                    placeholder="https://example.com/image.png"
                                    className="block w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all sm:text-sm hover:bg-white/10"
                                />
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={isLoading || success}
                                className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-lg hover:shadow-indigo-500/20"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                                        Creating...
                                    </>
                                ) : (
                                    "Create Organization"
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    )
}