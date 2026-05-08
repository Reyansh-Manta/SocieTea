"use client"

import { useParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { useAuth } from "../../context/AuthContext"
import Navbar from "../../components/Navbar/page"
import { Calendar, MapPin, Users, ArrowLeft, Share2, Heart, Clock, Ticket, Globe, Video, X, Check } from "lucide-react"

interface Org {
    _id: string;
    name: string;
    profilePic: string;
}

interface UserProfile {
    _id: string;
    fullName: string;
    profilePic: string;
}

interface Event {
    _id: string;
    name: string;
    startDate: string;
    endDate: string;
    location: string;
    poster: string;
    description?: string;
    shortDescription?: string;
    mode: string;
    formLink?: string;
    RSVP: UserProfile[]; // Populated now
    org: Org[];         // Populated now
}

export default function EventPage() {
    const params = useParams()
    const router = useRouter()
    const eventId = params?.id as string

    const { user, loading: userLoading, rsvpEvents, toggleRsvpInState, syncRsvps } = useAuth()
    const [event, setEvent] = useState<Event | null>(null)
    const [localLoading, setLocalLoading] = useState(true)
    const [activeTab, setActiveTab] = useState("Details")
    const [imgError, setImgError] = useState(false)
    const [showFullPoster, setShowFullPoster] = useState(false)
    const [showFormPopup, setShowFormPopup] = useState(false)

    // Derived state
    const isRsvped = event ? rsvpEvents.includes(event._id) : false

    useEffect(() => {
        const loadData = async () => {
            try {
                if (eventId) {
                    const eventRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? `http://${window.location.hostname}:9000` : 'http://localhost:9000')}/api/v1/events/get-event/${eventId}`)
                    if (eventRes.ok) {
                        const eventData = await eventRes.json()
                        const eventObj: Event = eventData.data
                        setEvent(eventObj)

                        // Sync RSVP status
                        if (user) {
                            // Check if current user is in the populated RSVP list or in global state
                            const isUserInList = eventObj.RSVP.some(u => u._id === user._id)
                            if (isUserInList) {
                                syncRsvps([eventObj._id])
                            }
                        }
                    } else {
                        console.error("Failed to fetch event")
                    }
                }
            } catch (error) {
                console.error("Error loading data:", error)
            } finally {
                setLocalLoading(false)
            }
        }

        if (!userLoading) {
            loadData()
        }
    }, [eventId, user, userLoading])

    const handleRSVP = async () => {
        if (!user) {
            router.push("/googleAuth")
            return
        }
        if (!event) return

        // If user is already RSVPed, just toggle off without popup
        if (isRsvped) {
            await confirmRSVP()
            return
        }

        // If not RSVPed, check for form link
        if (event.formLink) {
            setShowFormPopup(true)
            return
        }

        // If no form link, proceed normally
        await confirmRSVP()
    }

    const confirmRSVP = async () => {
        if (!event || !user) return

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? `http://${window.location.hostname}:9000` : 'http://localhost:9000')}/api/v1/events/toggle-rsvp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ eventId: event._id }),
                credentials: "include"
            })

            if (res.ok) {
                const data = await res.json()
                const isNowRsvped = data.data.isRsvped

                // Update global state
                toggleRsvpInState(event._id, isNowRsvped)

                // Optimistically update local attendees list
                setEvent(prev => {
                    if (!prev) return null
                    let newRSVP = [...prev.RSVP]
                    if (isNowRsvped) {
                        // Add user if not present
                        if (!newRSVP.some(u => u._id === user._id)) {
                            newRSVP.push({
                                _id: user._id,
                                fullName: user.fullName || user.username || "You",
                                profilePic: user.profilePic || ""
                            })
                        }
                    } else {
                        // Remove user
                        newRSVP = newRSVP.filter(u => u._id !== user._id)
                    }
                    return { ...prev, RSVP: newRSVP }
                })

                // Close popup if open
                setShowFormPopup(false)
            }
        } catch (error) {
            console.error("Error toggling RSVP:", error)
        }
    }

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleString('en-US', {
            weekday: 'long', month: 'short', day: 'numeric', year: 'numeric'
        })
    }

    const formatTime = (dateStr: string) => {
        return new Date(dateStr).toLocaleTimeString('en-US', {
            hour: 'numeric', minute: '2-digit'
        })
    }

    if (userLoading || localLoading) return (
        <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
    )

    if (!event) return (
        <div className="min-h-screen bg-[#09090b] text-white flex flex-col items-center justify-center">
            <h1 className="text-2xl font-bold mb-4">Event Not Found</h1>
            <button onClick={() => router.back()} className="text-indigo-400 hover:text-indigo-300">Go Back</button>
        </div>
    )

    const organizer = event.org && event.org.length > 0 ? event.org[0] : null

    return (
        <div className="min-h-screen bg-[#09090b] text-white font-sans selection:bg-indigo-500/30">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Header Section */}
                <div className="mb-12">
                    <button
                        onClick={() => router.back()}
                        className="mb-6 flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm font-medium tracking-wide group"
                    >
                        <div className="p-1.5 rounded-full bg-white/5 border border-white/5 group-hover:bg-white/10 transition-colors">
                            <ArrowLeft className="w-3 h-3" />
                        </div>
                        Back to Events
                    </button>

                    {/* Hero Section Redesign */}
                    <div className="relative w-full rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl bg-[#18181b]/50 backdrop-blur-sm group select-none">

                        {/* Ambient Background Layer */}
                        <div className="absolute inset-0 z-0 overflow-hidden">
                            {event.poster && (
                                <div
                                    className="absolute inset-0 bg-cover bg-center opacity-40 blur-[80px] scale-125 saturate-150 transition-transform duration-[3s]"
                                    style={{ backgroundImage: `url(${event.poster})` }}
                                />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-[#09090b] via-[#09090b]/80 to-[#09090b]/40 mix-blend-multiply" />
                            <div className="absolute inset-0 bg-black/20" />
                        </div>

                        <div className="relative z-10 flex flex-col md:flex-row p-6 md:p-10 lg:p-12 gap-8 md:gap-12 items-center">

                            {/* Portrait Poster Container */}
                            <div className="w-full md:w-auto flex-shrink-0 flex justify-center md:justify-start">
                                <div
                                    className="relative w-[280px] sm:w-[300px] md:w-[320px] aspect-[2/3] md:aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl shadow-black/50 ring-1 ring-white/10 rotate-2 hover:rotate-0 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-[1.02] cursor-pointer"
                                    onClick={() => !imgError && setShowFullPoster(true)}
                                >
                                    {event.poster && !imgError ? (
                                        <img
                                            src={event.poster}
                                            alt={event.name}
                                            className="object-cover w-full h-full"
                                            onError={() => setImgError(true)}
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-[#18181b] flex items-center justify-center">
                                            <div className="text-center p-4">
                                                <img src="/societea.png" alt="SocieTea Logo" className="w-24 mx-auto opacity-30 mb-2" />
                                                <span className="text-xs text-white/30 tracking-widest uppercase">No Poster</span>
                                            </div>
                                        </div>
                                    )}
                                    {/* Poster Shine Effect & Hint */}
                                    <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 bg-black/20 backdrop-blur-[2px]">
                                        <span className="px-3 py-1.5 rounded-full bg-black/50 text-white text-xs font-medium border border-white/20 backdrop-blur-md">View Fullscreen</span>
                                    </div>
                                </div>
                            </div>

                            {/* Event Details */}
                            <div className="flex-grow space-y-6 w-full text-center md:text-left">

                                {/* Org Badge & Status */}
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                    {organizer && (
                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-colors cursor-pointer group/org" onClick={(e) => { e.stopPropagation(); router.push(`/org/${organizer._id}`); }}>
                                            <img src={organizer.profilePic || "/api/placeholder/40/40"} alt="" className="w-5 h-5 rounded-full object-cover ring-1 ring-white/20" />
                                            <span className="text-sm font-medium text-gray-200 group-hover/org:text-white transition-colors">{organizer.name}</span>
                                        </div>
                                    )}
                                    <span className={`px-3 py-1.5 rounded-full border text-xs font-semibold uppercase tracking-wider backdrop-blur-md ${new Date(event.startDate) > new Date()
                                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                        : 'bg-gray-500/10 text-gray-400 border-gray-500/20'
                                        }`}>
                                        {new Date(event.startDate) > new Date() ? 'Upcoming' : 'Past Event'}
                                    </span>
                                    {isRsvped && (
                                        <span className="px-3 py-1.5 rounded-full border border-emerald-500/50 bg-emerald-500/20 text-emerald-300 text-xs font-semibold uppercase tracking-wider backdrop-blur-md flex items-center gap-1.5 animate-in fade-in zoom-in duration-300">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)] animate-pulse"></div>
                                            Registered
                                        </span>
                                    )}
                                </div>

                                {/* Title */}
                                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-gray-400 leading-[1.1] tracking-tight drop-shadow-sm selection:bg-indigo-500/30 selection:text-white">
                                    {event.name}
                                </h1>

                                {/* Key Info Grid */}
                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 border-t border-white/10 pt-6">
                                    <div className="p-3 md:p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors backdrop-blur-sm group/item">
                                        <div className="flex items-center justify-center md:justify-start gap-2 text-indigo-400 mb-1.5">
                                            <Calendar className="w-4 h-4" />
                                            <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-white/50 group-hover/item:text-white/70 transition-colors">Date</span>
                                        </div>
                                        <p className="font-semibold text-base md:text-lg text-white">{new Date(event.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', weekday: 'short' })}</p>
                                    </div>

                                    <div className="p-3 md:p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors backdrop-blur-sm group/item">
                                        <div className="flex items-center justify-center md:justify-start gap-2 text-indigo-400 mb-1.5">
                                            <Clock className="w-4 h-4" />
                                            <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-white/50 group-hover/item:text-white/70 transition-colors">Time</span>
                                        </div>
                                        <p className="font-semibold text-base md:text-lg text-white">{new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                    </div>

                                    <div className="col-span-2 lg:col-span-1 p-3 md:p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors backdrop-blur-sm group/item">
                                        <div className="flex items-center justify-center md:justify-start gap-2 text-indigo-400 mb-1.5">
                                            <MapPin className="w-4 h-4" />
                                            <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-white/50 group-hover/item:text-white/70 transition-colors">Location</span>
                                        </div>
                                        <p className="font-semibold text-base md:text-lg text-white truncate px-2 md:px-0" title={event.location}>{event.location}</p>
                                    </div>
                                </div>

                                {/* Social Actions */}
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 md:gap-4 pt-4">
                                    <button
                                        onClick={handleRSVP}
                                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.2)] ${isRsvped
                                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 hover:bg-emerald-500/30'
                                            : 'bg-white text-black hover:bg-gray-200'
                                            }`}
                                    >
                                        {isRsvped ? (
                                            <>
                                                <Check className="w-5 h-5" />
                                                <span>Registered</span>
                                            </>
                                        ) : (
                                            <>
                                                <Ticket className="w-5 h-5" />
                                                <span>RSVP Now</span>
                                            </>
                                        )}
                                    </button>
                                    <button className="p-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all hover:scale-110 active:scale-90 tooltip" title="Share Event">
                                        <Share2 className="w-5 h-5" />
                                    </button>
                                    <button className="p-3 rounded-xl bg-white/5 border border-white/10 text-pink-500 hover:bg-pink-500/10 transition-all hover:scale-110 active:scale-90 tooltip" title="Like Event">
                                        <Heart className="w-5 h-5" />
                                    </button>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Left Column: Main Content (8 cols) */}
                    <div className="lg:col-span-8 space-y-8">

                        {/* Tabs */}
                        <div className="flex items-center border-b border-white/10 overflow-x-auto scrollbar-hide">
                            {["Details", "Gallery", "Reviews"].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-6 py-4 text-sm font-medium transition-all relative ${activeTab === tab
                                        ? "text-indigo-400"
                                        : "text-gray-400 hover:text-gray-200"
                                        }`}
                                >
                                    {tab}
                                    {activeTab === tab && (
                                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-400 rounded-t-full shadow-[0_0_10px_rgba(129,140,248,0.5)]"></div>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        <div className="min-h-[200px]">
                            {activeTab === "Details" && (
                                <div className="space-y-8 animate-in fade-in duration-500">
                                    <div className="space-y-4">
                                        <h2 className="text-xl font-bold text-white">Description</h2>
                                        <p className="text-gray-300 leading-relaxed whitespace-pre-wrap text-[15px]">
                                            {event.description || event.shortDescription || "No description provided for this event."}
                                        </p>
                                    </div>

                                    {/* Schedule Section */}
                                    <div className="space-y-4">
                                        <h2 className="text-xl font-bold text-white">Schedule</h2>
                                        <div className="bg-[#18181b] border border-white/5 rounded-2xl p-6 relative overflow-hidden">
                                            <div className="absolute left-9 top-6 bottom-6 w-0.5 bg-gradient-to-b from-indigo-500/50 to-transparent"></div>

                                            <div className="relative z-10 space-y-8">
                                                <div className="flex items-start gap-6">
                                                    <div className="w-6 h-6 rounded-full bg-indigo-500/20 border-2 border-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.3)] shrink-0 mt-1"></div>
                                                    <div>
                                                        <h4 className="text-indigo-300 font-semibold mb-1">{formatTime(event.startDate)}</h4>
                                                        <p className="text-white font-medium text-lg">Event Starts</p>
                                                        <p className="text-gray-500 text-sm mt-1">{formatDate(event.startDate)}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-start gap-6">
                                                    <div className="w-6 h-6 rounded-full bg-purple-500/20 border-2 border-purple-500 shrink-0 mt-1"></div>
                                                    <div>
                                                        <h4 className="text-purple-300 font-semibold mb-1">{formatTime(event.endDate)}</h4>
                                                        <p className="text-white font-medium text-lg">Event Ends</p>
                                                        <p className="text-gray-500 text-sm mt-1">{formatDate(event.endDate)}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Map or Meet Link Section */}
                                    <div className="space-y-4">
                                        <h2 className="text-xl font-bold text-white">
                                            {event.mode === 'Online' ? 'Join Event' : 'Map'}
                                        </h2>

                                        {event.mode === 'Online' ? (
                                            <div className="bg-[#18181b] border border-white/5 rounded-2xl p-8 relative overflow-hidden group">
                                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5"></div>

                                                <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-4">
                                                    <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300 border border-indigo-500/20">
                                                        <Video className="w-8 h-8 text-indigo-400" />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <h3 className="text-lg font-semibold text-white">Virtual Meeting</h3>
                                                        <p className="text-gray-400 max-w-sm mx-auto">
                                                            This event is happening online. Click the button below to join the session.
                                                        </p>
                                                    </div>

                                                    <a
                                                        href={event.location.startsWith('http') ? event.location : `https://${event.location}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="mt-4 px-8 py-3 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-all shadow-lg hover:shadow-indigo-500/25 flex items-center gap-2"
                                                    >
                                                        <Video className="w-4 h-4" />
                                                        Join Meeting
                                                    </a>
                                                </div>

                                                {/* Decorative background elements */}
                                                <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl"></div>
                                                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl"></div>
                                            </div>
                                        ) : (
                                            <div className="bg-[#18181b] border border-white/5 rounded-2xl overflow-hidden h-64 relative group">
                                                {/* Placeholder Map - In real app, use Google Maps or similar */}
                                                <div className="absolute inset-0 bg-[#242427] flex items-center justify-center">
                                                    <div className="text-center opacity-50 group-hover:opacity-100 transition-opacity">
                                                        <MapPin className="w-12 h-12 text-gray-500 mx-auto mb-2" />
                                                        <p className="text-gray-400 text-sm">Map View for {event.location}</p>
                                                    </div>
                                                    {/* Decorative map lines */}
                                                    <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                                                        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                                                            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
                                                        </pattern>
                                                        <rect width="100%" height="100%" fill="url(#grid)" />
                                                    </svg>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                            {activeTab === "Gallery" && (
                                <div className="flex items-center justify-center h-48 bg-[#18181b] rounded-2xl border border-white/5 text-gray-400">
                                    <div className="text-center">
                                        <div className="inline-block p-4 rounded-full bg-white/5 mb-3">
                                            <Calendar className="w-6 h-6" />
                                        </div>
                                        <p>No photos uploaded yet.</p>
                                    </div>
                                </div>
                            )}
                            {activeTab === "Reviews" && (
                                <div className="flex items-center justify-center h-48 bg-[#18181b] rounded-2xl border border-white/5 text-gray-400">
                                    <div className="text-center">
                                        <div className="inline-block p-4 rounded-full bg-white/5 mb-3">
                                            <Users className="w-6 h-6" />
                                        </div>
                                        <p>No reviews yet.</p>
                                    </div>
                                </div>
                            )}
                        </div>

                    </div>

                    {/* Right Column: Sidebar (4 cols) */}
                    <div className="lg:col-span-4 space-y-6">

                        {/* Action Card */}
                        <div className="bg-[#18181b] rounded-3xl p-6 border border-white/5 shadow-xl sticky top-24">
                            <div className="space-y-6">
                                {/* Date & Time */}
                                <div className="bg-[#09090b]/50 rounded-2xl p-4 border border-white/5">
                                    <div className="flex items-start gap-4 mb-4 pb-4 border-b border-white/5">
                                        <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400">
                                            <Calendar className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Date</p>
                                            <p className="font-semibold text-white">{formatDate(event.startDate)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400">
                                            <Clock className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Time</p>
                                            <p className="font-semibold text-white">{formatTime(event.startDate)} - {formatTime(event.endDate)}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Location */}
                                <div className="bg-[#09090b]/50 rounded-2xl p-4 border border-white/5 flex items-start gap-4">
                                    <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400 shrink-0">
                                        <MapPin className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Location</p>
                                        <p className="font-semibold text-white leading-tight">{event.location}</p>
                                        <p className="text-xs text-gray-500 mt-1">View on map</p>
                                    </div>
                                </div>

                                {/* Price & Entry */}
                                <div className="bg-[#09090b]/50 rounded-2xl p-4 border border-white/5 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400">
                                            <Ticket className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Entry Fee</p>
                                            <p className="font-bold text-white text-lg">Free</p>
                                        </div>
                                    </div>
                                </div>

                                {/* External Form Link Button */}
                                {event.formLink && (
                                    <a
                                        href={event.formLink.startsWith('http') ? event.formLink : `https://${event.formLink}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full py-3 rounded-xl bg-[#242427] hover:bg-[#2a2a2d] border border-white/10 text-white font-semibold transition-all flex items-center justify-center gap-2 mb-2 group"
                                    >
                                        <div className="p-1.5 bg-indigo-500/20 rounded-lg group-hover:bg-indigo-500/30 transition-colors">
                                            <Ticket className="w-4 h-4 text-indigo-400" />
                                        </div>
                                        Fill Required Form
                                    </a>
                                )}

                                {/* Action Button */}
                                <button
                                    onClick={handleRSVP}
                                    className={`w-full py-4 rounded-xl text-lg font-bold transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 ${isRsvped
                                        ? 'bg-transparent border-2 border-emerald-500 text-emerald-400 hover:bg-emerald-500/10'
                                        : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-indigo-900/20'
                                        }`}
                                >
                                    {isRsvped ? (
                                        <>
                                            <span>Registered</span>
                                            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                                        </>
                                    ) : (
                                        "One-Click Register"
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Attendees Card */}
                        <div className="bg-[#18181b] rounded-3xl p-6 border border-white/5">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-lg">Who's going?</h3>
                                <span className="text-xs text-gray-500 font-medium bg-white/5 px-2 py-1 rounded-full">
                                    {event.RSVP.length} People
                                </span>
                            </div>

                            {event.RSVP && event.RSVP.length > 0 ? (
                                <div className="grid grid-cols-4 gap-3">
                                    {event.RSVP.slice(0, 11).map((attendee, i) => (
                                        <div key={attendee._id || i} className="flex flex-col items-center group cursor-pointer">
                                            <div className="w-12 h-12 rounded-full border-2 border-[#18181b] overflow-hidden bg-gray-800 relative transition-transform group-hover:scale-110">
                                                {attendee.profilePic ? (
                                                    <img src={attendee.profilePic} alt={attendee.fullName} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-400">
                                                        {(attendee.fullName || "?").charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                            </div>
                                            <p className="text-[10px] text-gray-500 mt-1 truncate w-full text-center group-hover:text-white transition-colors">
                                                {attendee.fullName?.split(' ')[0]}
                                            </p>
                                        </div>
                                    ))}
                                    {event.RSVP.length > 11 && (
                                        <div className="flex flex-col items-center justify-center w-12 h-12 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-gray-400">
                                            +{event.RSVP.length - 11}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-6">
                                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3 text-gray-600">
                                        <Users className="w-5 h-5" />
                                    </div>
                                    <p className="text-sm text-gray-500">Be the first to join!</p>
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </div>
            {/* Full Screen Poster Modal */}
            {
                showFullPoster && event.poster && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200"
                        onClick={() => setShowFullPoster(false)}
                    >
                        <button
                            onClick={() => setShowFullPoster(false)}
                            className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white"
                        >
                            <X className="w-6 h-6" />
                        </button>
                        <img
                            src={event.poster}
                            alt={event.name}
                            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking image itself
                        />
                    </div>
                )
            }

            {/* RSVP Form Popup Modal */}
            {showFormPopup && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowFormPopup(false)} />
                    <div className="relative bg-[#18181b] border border-white/10 rounded-2xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                                <Ticket className="w-6 h-6 text-indigo-400" />
                            </div>

                            <h3 className="text-2xl font-bold text-white">Registration Required</h3>

                            <p className="text-gray-300">
                                This event requires you to fill out an external form before we can confirm your RSVP.
                            </p>

                            <div className="w-full space-y-3 pt-2">
                                <a
                                    href={event?.formLink?.startsWith('http') ? event.formLink : `https://${event?.formLink}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block w-full py-3.5 rounded-xl bg-white text-black font-bold hover:bg-gray-200 transition-colors"
                                >
                                    Open Form
                                </a>

                                <button
                                    onClick={confirmRSVP}
                                    className="block w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors border border-indigo-500/50"
                                >
                                    I've Filled It, RSVP Me
                                </button>

                                <button
                                    onClick={() => setShowFormPopup(false)}
                                    className="block w-full py-2 text-sm text-gray-500 hover:text-gray-300 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div >
    )
}