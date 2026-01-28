"use client"

import { useSearchParams, useParams } from "next/navigation"
import Navbar from "../../components/Navbar/page"
import { useState, useEffect } from "react"
import { Settings, Calendar, MapPin, Users, Heart, Share2, MoreVertical } from "lucide-react"

interface User {
    _id: string;
    fullName: string;
    username: string;
    Organization: string; // This is the College Name
}

interface Org {
    _id: string;
    name: string;
    profilePic?: string;
    description?: string;
    admin: string[]; // List of User IDs
    members?: string[];
}

interface Event {
    _id: string;
    name: string;
    organizer: string;
    startDate: string;
    endDate: string;
    location: string;
    poster: string;
    description?: string;
}

export default function OrgPage() {
    const params = useParams()
    const searchParams = useSearchParams()

    // params.id is the Org Name (slug)
    const orgNameSlug = params?.id ? decodeURIComponent(params.id as string) : ""
    const dbId = searchParams.get("id")

    const [user, setUser] = useState<User | null>(null)
    const [org, setOrg] = useState<Org | null>(null)
    const [loading, setLoading] = useState(true)
    const [isMember, setIsMember] = useState(false)
    const [isAdmin, setIsAdmin] = useState(false)

    // Events State
    const [allEvents, setAllEvents] = useState<Event[]>([])
    const [rsvpEvents, setRsvpEvents] = useState<string[]>([]) // use string IDs

    useEffect(() => {
        const loadDat = async () => {
            try {
                // 1. Fetch User
                const userRes = await fetch("http://localhost:9000/api/v1/user/getUser", {
                    credentials: "include"
                })
                const userDataWrapper = await userRes.json()
                const currentUser = userDataWrapper.data?.user

                if (currentUser) {
                    setUser(currentUser)

                    // 2. Fetch All Orgs for the User's College
                    if (currentUser.Organization) {
                        const orgsRes = await fetch("http://localhost:9000/api/v1/college/get-college-orgs", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ college_nameid: currentUser.Organization })
                        })
                        const orgsResult = await orgsRes.json()
                        const allOrgs: Org[] = orgsResult.data || []

                        // 3. Find this specific Org
                        const foundOrg = allOrgs.find(o => o._id === dbId) || allOrgs.find(o => o.name === orgNameSlug)

                        if (foundOrg) {
                            setOrg(foundOrg)

                            // Check Admin Status
                            if (foundOrg.admin && foundOrg.admin.includes(currentUser._id)) {
                                setIsAdmin(true)
                            }

                            // Check Member Status
                            if (foundOrg.members && foundOrg.members.includes(currentUser._id)) {
                                setIsMember(true)
                            }

                            // 4. Fetch Events for this Org
                            const eventsRes = await fetch("http://localhost:9000/api/v1/events/get-org-events", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ orgId: foundOrg._id })
                            })
                            const eventsData = await eventsRes.json()
                            if (eventsRes.ok) {
                                setAllEvents(eventsData.data)
                            }
                        }
                    }
                }
            } catch (error) {
                console.error("Error fetching data:", error)
            } finally {
                setLoading(false)
            }
        }

        loadDat()
    }, [dbId, orgNameSlug])


    const [activeTab, setActiveTab] = useState('Events')

    // Handlers
    const handleFollow = async () => {
        if (!org || !user) return;
        try {
            const res = await fetch("http://localhost:9000/api/v1/orgs/toggle-membership", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orgId: org._id }),
                credentials: "include"
            });
            if (res.ok) {
                const data = await res.json();
                setIsMember(data.data.isMember);
            }
        } catch (error) {
            console.error("Error toggling membership:", error);
        }
    }

    const handleRSVP = (eventId: string) => {
        setRsvpEvents(prev =>
            prev.includes(eventId) ? prev.filter(id => id !== eventId) : [...prev, eventId]
        );
    }

    // Helper to format date
    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleString('en-US', {
            weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric'
        })
    }

    // Filter events
    const now = new Date();
    const ongoingEvents = allEvents.filter(e => new Date(e.startDate) <= now && new Date(e.endDate) >= now)
    const upcomingEvents = allEvents.filter(e => new Date(e.startDate) > now)
    const pastEvents = allEvents.filter(e => new Date(e.endDate) < now)

    if (loading) return <div className="min-h-screen bg-[#131515] flex items-center justify-center text-white">Loading...</div>

    return (
        <div className="min-h-screen bg-[#131515] text-white font-sans">
            <Navbar />

            {/* Main Content Container */}
            <main className="max-w-7xl mx-auto px-4 md:px-8 py-6">

                {/* Header Section */}
                <div className="relative rounded-3xl overflow-hidden bg-[#1D1F21] border border-white/5 shadow-2xl">
                    {/* Cover Image/Pattern */}
                    <div className="h-48 md:h-64 w-full bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 relative">
                        <div className="absolute inset-0 opacity-30"
                            style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/circuit-board.png')" }}>
                        </div>
                        {/* Overlay Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#1D1F21] to-transparent"></div>
                    </div>

                    {/* Header Info */}
                    <div className="px-8 pb-6 -mt-16 flex flex-col md:flex-row items-start md:items-end justify-between gap-4 relative z-10">
                        <div className="flex items-end gap-6">
                            {/* Logo */}
                            <div className="w-32 h-32 rounded-3xl bg-[#0f0f0f] border-4 border-[#1D1F21] flex items-center justify-center shadow-lg overflow-hidden">
                                {org?.profilePic ? (
                                    <img src={org.profilePic} alt={org.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="text-4xl">⚛️</div>
                                )}
                            </div>

                            <div className="mb-2">
                                <h1 className="text-3xl md:text-4xl font-bold text-white">{org?.name || orgNameSlug}</h1>
                                <p className="text-gray-400 text-sm mt-1">{org?.description || "Tech & Coding enthusiasts aiming to innovate."}</p>
                            </div>
                        </div>

                        <button
                            onClick={handleFollow}
                            className={`px-8 py-2.5 rounded-full font-medium transition-all shadow-[0_0_20px_rgba(79,70,229,0.4)] ${isMember ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
                        >
                            {isMember ? "Following" : "Follow"}
                        </button>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="px-8 mt-6 border-t border-white/10 flex items-center justify-between">
                        <div className="flex gap-8">
                            {['About Us', 'Events', 'Posts', 'Members'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === tab ? 'border-indigo-500 text-white' : 'border-transparent text-gray-400 hover:text-white'}`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {/* Admin Only Setting */}
                        {isAdmin && (
                            <a href={`/org/${dbId || orgNameSlug}/manage`} className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors py-4">
                                <Settings className="w-5 h-5" />
                                <span className="text-sm font-medium">Manage Society</span>
                            </a>
                        )}
                    </div>
                </div>

                {/* Body Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">

                    {/* Left Column (Main Content based on Tab) */}
                    <div className="lg:col-span-2 space-y-8">

                        {activeTab === 'Events' && (
                            <>
                                {/* Ongoing Events */}
                                {ongoingEvents.length > 0 && (
                                    <section>
                                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-green-400">
                                            <span className="relative flex h-3 w-3">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                            </span>
                                            Happening Now
                                        </h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {ongoingEvents.map(event => (
                                                <EventCard key={event._id} event={event} handleRSVP={handleRSVP} rsvpEvents={rsvpEvents} orgName={org?.name} />
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {/* Upcoming Events */}
                                <section>
                                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                        Upcoming Events
                                    </h2>
                                    {upcomingEvents.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {upcomingEvents.map(event => (
                                                <EventCard key={event._id} event={event} handleRSVP={handleRSVP} rsvpEvents={rsvpEvents} orgName={org?.name} />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="bg-[#1D1F21] rounded-2xl p-6 border border-white/5 text-center text-gray-500">
                                            No upcoming events
                                        </div>
                                    )}
                                </section>

                                {/* Past Events */}
                                <section>
                                    <h2 className="text-xl font-bold mb-4 opacity-70">Past Events</h2>
                                    {pastEvents.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-70 hover:opacity-100 transition-opacity">
                                            {pastEvents.map(event => (
                                                <EventCard key={event._id} event={event} handleRSVP={handleRSVP} rsvpEvents={rsvpEvents} orgName={org?.name} isPast />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="bg-[#1D1F21] rounded-2xl p-6 border border-white/5 text-center text-gray-500">
                                            No past events to show
                                        </div>
                                    )}
                                </section>
                            </>
                        )}

                        {activeTab === 'About Us' && (
                            <div className="bg-[#1D1F21] rounded-2xl p-6 border border-white/5">
                                <h2 className="text-xl font-bold mb-4">About Us</h2>
                                <p className="text-gray-300 leading-relaxed">
                                    {org?.description || "We are a community of developers, designers, and tech enthusiasts. Our mission is to foster innovation and learning through workshops, hackathons, and collaborative projects."}
                                </p>
                            </div>
                        )}

                        {activeTab === 'Posts' && (
                            <div className="bg-[#1D1F21] rounded-2xl p-6 border border-white/5 text-center text-gray-500">
                                <p>No posts available yet.</p>
                            </div>
                        )}

                        {activeTab === 'Members' && (
                            <div className="bg-[#1D1F21] rounded-2xl p-6 border border-white/5 text-center text-gray-500">
                                <p>Member list integration coming soon.</p>
                            </div>
                        )}

                    </div>


                    {/* Right Column (Sidebar) */}
                    <div className="space-y-6">
                        {/* Contact / Socials Placeholder */}
                        <div className="bg-[#1D1F21] rounded-3xl p-6 border border-white/5">
                            <h3 className="text-lg font-bold mb-4">Contact</h3>
                            <div className="flex gap-4 text-gray-400">
                                <Share2 className="w-5 h-5 hover:text-white cursor-pointer" />
                                <Heart className="w-5 h-5 hover:text-white cursor-pointer" />
                                <MoreVertical className="w-5 h-5 hover:text-white cursor-pointer" />
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    )
}

function EventCard({ event, handleRSVP, rsvpEvents, orgName, isPast = false }: { event: Event, handleRSVP: any, rsvpEvents: string[], orgName?: string, isPast?: boolean }) {
    const isRsvped = rsvpEvents.includes(event._id)

    // Helper to format date
    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleString('en-US', {
            weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric'
        })
    }

    return (
        <div className="bg-[#1D1F21] rounded-2xl p-4 border border-white/5 hover:border-white/10 transition-all group flex flex-col h-full">
            <div className="h-32 rounded-xl bg-gray-800 mb-4 overflow-hidden relative">
                {event.poster ? (
                    <img src={event.poster} alt={event.name} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-900 to-purple-900 flex items-center justify-center">
                        <Calendar className="w-10 h-10 text-white/20" />
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            </div>
            <h3 className="text-lg font-bold text-white mb-1">{event.name}</h3>
            <p className="text-gray-400 text-xs mb-3">Organized by {orgName}</p>

            <div className="space-y-2 text-sm text-gray-300 mb-4 flex-grow">
                <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-indigo-400" />
                    <span>{formatDate(event.startDate)}</span>
                </div>
                <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-indigo-400" />
                    <span className="truncate">{event.location}</span>
                </div>
            </div>

            {!isPast && (
                <button
                    onClick={() => handleRSVP(event._id)}
                    className={`w-full py-2 rounded-xl text-sm font-medium transition-colors ${isRsvped ? 'bg-green-600/20 text-green-400 hover:bg-green-600/30' : 'bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400'}`}
                >
                    {isRsvped ? "RSVP'd" : "RSVP"}
                </button>
            )}
        </div>
    )
}
