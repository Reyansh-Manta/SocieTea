"use client"

import { useState, useEffect } from "react"
import { Search, MapPin, School, ArrowRight, Loader2, X, Mail, CheckCircle2 } from "lucide-react"
import { useRouter } from "next/navigation"

const PAGE_SIZE = 21;

export default function CollegeSelection() {
    const router = useRouter()
    const [searchTerm, setSearchTerm] = useState("")
    const [colleges, setColleges] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)

    // Modal State
    const [selectedCollege, setSelectedCollege] = useState<any>(null)
    const [showModal, setShowModal] = useState(false)
    const [emailFormat, setEmailFormat] = useState("")
    const [submittingFormat, setSubmittingFormat] = useState(false)
    const [submissionSuccess, setSubmissionSuccess] = useState(false)

    const fetchColleges = async (currentPage: number, search: string, shouldAppend: boolean) => {
        setLoading(true)
        try {
            const response = await fetch(`http://localhost:9000/api/v1/college/get-colleges?search=${encodeURIComponent(search)}&page=${currentPage}&limit=${PAGE_SIZE}`)
            const data = await response.json()

            if (data.success) {
                if (shouldAppend) {
                    setColleges(prev => [...prev, ...data.data])
                } else {
                    setColleges(data.data)
                }

                if (data.data.length < PAGE_SIZE) {
                    setHasMore(false)
                } else {
                    setHasMore(true)
                }
            }
        } catch (error) {
            console.error("Error fetching colleges:", error)
        } finally {
            setLoading(false)
        }
    }

    // Effect for search term changes
    useEffect(() => {
        setPage(1)
        const timeoutId = setTimeout(() => {
            fetchColleges(1, searchTerm, false)
        }, 300)
        return () => clearTimeout(timeoutId)
    }, [searchTerm])

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchColleges(nextPage, searchTerm, true);
    }

    const handleSelectCollege = (college: any) => {
        setSelectedCollege(college)
        setEmailFormat("")
        setSubmissionSuccess(false)
        setShowModal(true)
    }

    const handleSubmitFormat = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!emailFormat.trim()) return

        setSubmittingFormat(true)

        let processedFormat = emailFormat.trim();
        if (processedFormat.includes("@")) {
            processedFormat = processedFormat.substring(processedFormat.indexOf("@"));
        } else if (!processedFormat.startsWith("@")) {
            processedFormat = "@" + processedFormat;
        }

        // Simulate API call
        // await new Promise(resolve => setTimeout(resolve, 1000))
        try {
            const response = await fetch("http://localhost:9000/api/v1/college/submit-email-format", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    college_nameid: selectedCollege._id,
                    emailFormat: processedFormat,
                }),
            })

            const data = await response.json()

            if (data.statusCode === 200) {
                console.log(`Submitted format for ${selectedCollege.name}: ${processedFormat}`)
                setSubmittingFormat(false)
                setSubmissionSuccess(true)

                // Close modal after success
                setTimeout(() => {
                    setShowModal(false)
                }, 2000)
            } else {
                console.error("Failed to submit format:", data.message)
                setSubmittingFormat(false)
                // Optionally handle error state in UI
            }
        } catch (error) {
            console.error("Error submitting format:", error)
            setSubmittingFormat(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-indigo-500/30">
            {/* Background Gradients */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-900/20 rounded-full blur-[120px]" />
                <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-blue-900/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] bg-purple-900/10 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 flex flex-col items-center pt-8 pb-4">
                <div className="flex items-center gap-4 mb-4">
                    {/* <img src="/societea.png" alt="SocieTea Logo" className="h-25 w-auto" /> */}
                    {/* <span className="text-2xl font-bold tracking-tight text-white"></span> */}
                </div>
            </div>

            <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col items-center mb-16 text-center animate-fade-in">
                    <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-200 via-white to-indigo-200 tracking-tight">
                        Select Your College
                    </h1>
                    <p className="text-gray-400 text-lg mb-10 max-w-2xl">
                        Discover and connect with your campus community. Find your university to get started with SocieTea.
                    </p>

                    {/* Search Bar */}
                    <div className="relative w-full max-w-2xl group">
                        <input
                            type="text"
                            className="block w-full pl-12 pr-12 py-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all duration-300 shadow-xl shadow-black/20 hover:bg-white/[0.07]"
                            placeholder="Search by college name or city..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-500 group-focus-within:text-indigo-400 transition-colors duration-300" aria-hidden="true" />
                        </div>
                        {loading && (
                            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                <Loader2 className="h-5 w-5 text-indigo-400 animate-spin" />
                            </div>
                        )}
                    </div>
                </div>

                {/* College Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                    {colleges.length > 0 ? (
                        colleges.map((college, index) => (
                            <div
                                key={college._id}
                                className="group relative bg-white/[0.03] backdrop-blur-md border border-white/5 rounded-3xl p-6 hover:bg-white/[0.06] hover:border-indigo-500/30 transition-all duration-300 hover:-translate-y-1 animate-slide-up"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500/10 to-blue-600/10 rounded-2xl flex items-center justify-center border border-indigo-500/20 group-hover:border-indigo-500/40 transition-colors">
                                        <School className="h-6 w-6 text-indigo-400 group-hover:text-indigo-300" />
                                    </div>
                                    <button
                                        onClick={() => handleSelectCollege(college)}
                                        className="h-10 px-5 flex items-center gap-2 bg-white/5 hover:bg-indigo-600 border border-white/10 hover:border-indigo-500 rounded-xl text-sm font-medium text-gray-300 hover:text-white transition-all duration-300 group/btn"
                                    >
                                        Select
                                        <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover/btn:opacity-100 group-hover/btn:translate-x-0 transition-all duration-300" />
                                    </button>
                                </div>

                                <h3 className="text-xl font-bold mb-2 text-gray-100 group-hover:text-white transition-colors line-clamp-2 min-h-[3.5rem]">
                                    {college.name}
                                </h3>

                                <div className="flex items-center text-gray-500 text-sm group-hover:text-gray-400 transition-colors">
                                    <MapPin className="h-4 w-4 mr-1.5 shrink-0" />
                                    <span className="truncate">{college.location || "Location not specified"}</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        !loading && (
                            <div className="col-span-full py-20 text-center">
                                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Search className="h-8 w-8 text-gray-600" />
                                </div>
                                <h3 className="text-lg font-medium text-white mb-1">No colleges found</h3>
                                <p className="text-gray-500">We couldn't find any colleges matching "{searchTerm}"</p>
                            </div>
                        )
                    )}
                </div>

                {/* Bottom Actions */}
                <div className="flex justify-center pb-20">
                    {hasMore && (
                        <button
                            onClick={handleLoadMore}
                            disabled={loading}
                            className="group relative px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white rounded-full text-sm font-medium transition-all disabled:opacity-50 overflow-hidden"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                {loading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Loading...
                                    </>
                                ) : (
                                    "Load More Colleges"
                                )}
                            </span>
                        </button>
                    )}
                </div>
            </main>

            {/* Email Format Modal */}
            {showModal && selectedCollege && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowModal(false)} />
                    <div className="relative w-full max-w-md bg-[#131515] border border-white/10 rounded-3xl p-8 shadow-2xl animate-slide-up ring-1 ring-white/10">
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-4 right-4 p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-500/30">
                                <Mail className="h-8 w-8 text-indigo-400" />
                            </div>
                            <h2 className="text-2xl font-bold mb-2">College Email Format</h2>
                            <p className="text-gray-400 text-sm">
                                {selectedCollege.name}
                            </p>
                        </div>

                        {/* Logic to determine available formats */}
                        {(selectedCollege.emailFormats?.length > 0) && !submissionSuccess ? (
                            <div className="space-y-4 mb-6">
                                <p className="text-sm text-gray-400 text-center mb-2">Select the email format you use:</p>

                                {/* Unique list of formats */}
                                {selectedCollege.emailFormats.map((format: any, idx: number) => (
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            console.log(`Selected format: ${format}`);
                                            localStorage.setItem('selectedEmailFormat', format);
                                            localStorage.setItem('selectedOrganization', selectedCollege.name);
                                            setShowModal(false);
                                            router.push("/googleAuth");
                                        }}
                                        className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all group"
                                    >
                                        <code className="text-indigo-300 font-mono text-sm">{format}</code>
                                        <ArrowRight className="h-4 w-4 text-gray-500 group-hover:text-white transition-colors" />
                                    </button>
                                ))}

                                <div className="pt-2 border-t border-white/10 mt-4">
                                    <button
                                        onClick={() => {
                                            // Temporarily clear formats to show form logic (or better, toggle a "showForm" state)
                                            // For simplicity, we can just use a local state to toggle view, but here I'll just conditionally render based on a new state
                                            setSelectedCollege({ ...selectedCollege, _showForm: true })
                                        }}
                                        className="w-full py-2 text-sm text-gray-500 hover:text-gray-300 transition-colors"
                                    >
                                        + Add another format
                                    </button>
                                </div>
                            </div>
                        ) : null}


                        {/* Form for adding new format (show if no formats OR user clicked Add Another) */}
                        {(!selectedCollege.emailFormats?.length) || selectedCollege._showForm ? (
                            <div className="mb-6">
                                {submissionSuccess ? (
                                    <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex flex-col items-center text-center animate-fade-in">
                                        <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center mb-2">
                                            <CheckCircle2 className="h-5 w-5 text-green-400" />
                                        </div>
                                        <h3 className="text-green-100 font-medium">Thank you!</h3>
                                        <p className="text-green-500/80 text-sm">We've received the email format.</p>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmitFormat}>
                                        <div className="bg-yellow-500/5 border border-yellow-500/10 rounded-xl p-4 mb-4">
                                            <p className="text-sm text-yellow-500/80 text-center">
                                                {selectedCollege._showForm ? "Add an alternative email format." : "We don't have the email format for this college yet. Help us by adding it!"}
                                            </p>
                                        </div>

                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Suggest Email Format
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all mb-4"
                                            placeholder="e.g. rollnumber@college.ac.in"
                                            value={emailFormat}
                                            onChange={(e) => setEmailFormat(e.target.value)}
                                            required
                                        />

                                        <div className="flex gap-3">
                                            {selectedCollege._showForm && (
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedCollege({ ...selectedCollege, _showForm: false })}
                                                    className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-gray-300 font-medium rounded-xl transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                            )}
                                            <button
                                                type="submit"
                                                disabled={submittingFormat || !emailFormat.trim()}
                                                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                                            >
                                                {submittingFormat ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    "Submit Format"
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        ) : null}
                    </div>
                </div>
            )}
        </div>
    )
}