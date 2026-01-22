"use client"

import { Search, Bell, User, Menu } from "lucide-react"

export default function Navbar() {
    return (
        <nav className="sticky top-0 z-50 w-full bg-[#050505]/80 backdrop-blur-xl border-b border-white/5 transition-all duration-300">
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-22">

                    {/* Logo Section */}
                    <a href="/home" className="flex-shrink-0 group">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-xl group-hover:bg-indigo-500/30 transition-all duration-500 opacity-0 group-hover:opacity-100" />
                                <img src="/societea.png" alt="SocieTea Logo" className="h-18 w-auto relative z-10 transform group-hover:scale-105 transition-transform duration-300" />
                            </div>
                        </div>
                    </a>

                    {/* Search Bar */}
                    <div className="hidden md:flex flex-1 justify-center px-8">
                        <div className="w-full max-w-lg relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-500 group-focus-within:text-indigo-400 transition-colors duration-300" aria-hidden="true" />
                            </div>
                            <input
                                id="search"
                                className="block w-full pl-11 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-full text-gray-300 placeholder-gray-500 focus:outline-none focus:bg-white/10 focus:border-indigo-500/30 focus:ring-1 focus:ring-indigo-500/30 transition-all duration-300 sm:text-sm hover:bg-white/[0.08]"
                                placeholder="Search societies, events, or people..."
                                type="search"
                            />
                            {/* Command k hint or similar could act here */}
                            {/* <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                                <kbd className="hidden lg:inline-flex h-5 items-center gap-1 rounded border border-white/10 bg-white/5 px-1.5 font-mono text-[10px] font-medium text-gray-500">
                                    <span className="text-xs">⌘</span>K
                                </kbd>
                            </div> */}
                        </div>
                    </div>

                    {/* Right Section: Notifications & Profile */}
                    <div className="flex items-center gap-3 sm:gap-4">
                        {/* Mobile Search Toggle */}
                        <button className="md:hidden p-2.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-300">
                            <Search className="h-5 w-5" />
                        </button>

                        {/* Notification */}
                        <button className="relative p-2.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-300 group">
                            <span className="sr-only">View notifications</span>
                            <div className="absolute top-2.5 right-2.5 h-2 w-2 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.5)] opacity-0 group-hover:opacity-100 transition-opacity" />
                            <Bell className="h-5 w-5" />
                        </button>

                        {/* Profile Dropdown Trigger */}
                        <div className="relative pl-2 border-l border-white/10">
                            <button className="flex items-center gap-3 p-1 pl-2 rounded-full text-gray-400 hover:text-white transition-colors group">
                                <span className="sr-only">Open user menu</span>
                                <div className="hidden sm:flex flex-col items-end mr-2">
                                    <span className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors">You</span>
                                    {/* <span className="text-xs text-indigo-400">Student</span> */}
                                </div>
                                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center ring-2 ring-transparent group-hover:ring-indigo-500/20 transition-all duration-300 overflow-hidden">
                                    {/* Placeholder for user image or icon */}
                                    <User className="h-5 w-5 text-indigo-300 group-hover:text-indigo-200" />
                                </div>
                            </button>
                        </div>

                        {/* Mobile Menu Button - Optional, kept basic for now */}
                        {/* <button className="md:hidden ml-2 p-2 rounded-md text-gray-400 hover:text-white hover:bg-white/10">
                             <Menu className="h-6 w-6" />
                        </button> */}
                    </div>
                </div>
            </div>
        </nav>
    )
}