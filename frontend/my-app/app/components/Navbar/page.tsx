"use client"

import { Search, Bell, User } from "lucide-react"

export default function Navbar() {
    return (
        <nav className="sticky top-0 z-50 w-full bg-[#131515] border-b border-gray-800">
            <div className="w-full px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between py-5">
                    {/* Logo Section */}
                    <a href="/home">
                        <div className="flex-shrink-0 flex items-center">
                            <img src="/societea.png" alt="SocieTea Logo" className="h-20 w-auto" />
                        </div>
                    </a>

                    {/* Search Bar */}
                    <div className="flex-1 flex justify-center px-2 lg:ml-6">
                        <div className="max-w-2xl w-full">
                            <label htmlFor="search" className="sr-only">Search</label>
                            <div className="relative text-gray-400 focus-within:text-white">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="h-6 w-6" aria-hidden="true" />
                                </div>
                                <input
                                    id="search"
                                    className="block w-full pl-12 pr-3 py-3 border border-transparent rounded-md leading-5 bg-gray-800 text-gray-300 placeholder-gray-400 focus:outline-none focus:bg-gray-700 focus:border-white focus:ring-white text-lg transition duration-150 ease-in-out"
                                    placeholder="Search societies, events..."
                                    type="search"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right Section: Notifications & Profile */}
                    <div className="flex items-center gap-4">
                        {/* Notification */}
                        <button className="p-2 rounded-full text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#131515] focus:ring-white transition-colors">
                            <span className="sr-only">View notifications</span>
                            <Bell className="h-6 w-6" />
                        </button>

                        {/* Profile */}
                        <div className="relative ml-2">
                            <button className="flex items-center max-w-xs p-2 rounded-full text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#131515] focus:ring-white transition-colors">
                                <span className="sr-only">Open user menu</span>
                                <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center border border-gray-600">
                                    <User className="h-5 w-5" />
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    )
}