"use client"

import { useParams } from "next/navigation"

export default function ManageOrg() {
    const params = useParams()
    const orgId = params?.id

    return (
        <div className="min-h-screen bg-[#131515] text-white flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-3xl font-bold mb-4">Manage Organization</h1>
                <p className="text-gray-400">Settings for Org: {orgId}</p>
                <p className="text-sm text-gray-500 mt-2">Work in Progress</p>
            </div>
        </div>
    )
}
