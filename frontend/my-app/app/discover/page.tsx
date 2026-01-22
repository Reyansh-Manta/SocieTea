"use client"

import { useState, useEffect } from "react"


export default function Discover() {

    const [login, setLogin] = useState(false)
    const [data, setData] = useState<any>(null)
    const [orgs, setOrgs] = useState<any[]>([])

    async function checkLogin() {
        try {
            const response = await fetch("http://localhost:9000/api/v1/user/getUser", {
                method: "GET",
                credentials: "include"
            })
            const data = await response.json()
            if (response.ok) {
                setLogin(true);
                setData(data.data)
            } else {
                setLogin(false);
            }
        } catch (error) {
            setLogin(false);
        }
    }

    useEffect(() => {
        checkLogin()
    }, [])

    useEffect(() => {
        const fetchOrgs = async () => {
            if (data && data.Organization) {
                try {
                    const response = await fetch("http://localhost:9000/api/v1/college/get-college-orgs", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ college_nameid: data.Organization })
                    });
                    const result = await response.json();
                    if (response.ok) {
                        setOrgs(result.data || []);
                    }
                } catch (error) {
                    console.error("Failed to fetch orgs", error);
                }
            }
        };

        if (login && data) {
            fetchOrgs();
        }
    }, [login, data]);
    console.log(data);

    if (login) {
        return (
            <div>
                <h1>Welcome, {data?.user.fullName}</h1>
                <p>Your College: {data?.user.Organization}</p>
                <div className="mt-4">
                    <h2 className="text-xl font-bold mb-2">Organizations in your College:</h2>
                    {orgs.length > 0 ? (
                        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {orgs.map((org: any) => (
                                <li key={org._id} className="border p-4 rounded shadow">
                                    <h3 className="font-bold">{org.name}</h3>
                                    {org.profilePic && <img src={org.profilePic} alt={org.name} className="w-16 h-16 rounded-full mt-2" />}
                                    <p className="text-sm mt-2">{org.Description}</p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No organizations found for your college.</p>
                    )}
                </div>
            </div>
        )
    } else {
        return (
            <div>you are not logged in</div>
        )
    }
}
