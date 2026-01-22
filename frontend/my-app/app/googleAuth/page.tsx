'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from "lucide-react";

export default function GoogleLoginButton() {

  const router = useRouter()
  const [errorMessage, setErrorMessage] = useState('');

  async function handleCredentialResponse(response: any) {
    setErrorMessage(''); // Clear previous errors
    const googleIdToken = response.credential;
    const emailFormat = localStorage.getItem('selectedEmailFormat');
    const organization = localStorage.getItem('selectedOrganization');

    try {
      const res = await fetch(
        'http://localhost:9000/api/v1/user/googleAuth',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            id_token: googleIdToken,
            emailFormat: emailFormat,
            organization: organization
          }),
        }
      );

      const contentType = res.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const data = await res.json();
        console.log(data);

        if (data.success || data.statusCode === 200) {
          if (data.data.FullyRegistered == "true") {
            router.push('/discover');
          } else {
            router.push('/register');
          }
        } else {
          console.log(data.message);
          const msg = data.message || "Login failed.";
          setErrorMessage(msg);
        }
      } else {
        // If response is not JSON (e.g., 500 HTML error page)
        const text = await res.text();
        console.error("Non-JSON Response:", text);
        setErrorMessage("Server error. Please check console.");
      }

    } catch (error) {
      console.error("Login Error:", error);
      setErrorMessage("Network or parsing error. See console.");
    }

  }

  useEffect(() => {
    const interval = setInterval(() => {
      if (!window.google) return;

      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        callback: handleCredentialResponse,
      });

      window.google.accounts.id.renderButton(
        document.getElementById('google-login-btn')!,
        {
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          shape: 'pill',
        }
      );

      clearInterval(interval);
    }, 100);

    return () => clearInterval(interval);
  }, []);


  // Redesigned GoogleLoginButton
  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center relative overflow-hidden selection:bg-indigo-500/30">

      {/* Aurora Background Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-purple-900/30 rounded-full blur-[130px]" />
        <div className="absolute top-[10%] right-[-10%] w-[50%] h-[60%] bg-indigo-900/20 rounded-full blur-[130px]" />
        <div className="absolute top-[40%] right-[20%] w-[30%] h-[30%] bg-emerald-900/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-20%] left-[10%] w-[50%] h-[50%] bg-purple-800/20 rounded-full blur-[130px]" />
      </div>

      <div className="relative z-10 w-full max-w-[420px] px-4">

        {/* Unified Glass Card */}
        <div className="bg-white/[0.02] border border-white/10 rounded-[2.5rem] p-10 shadow-2xl backdrop-blur-2xl ring-1 ring-white/5 animate-slide-up relative overflow-hidden group">

          {/* Subtle sheen effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

          <div className="flex flex-col items-center relative z-10">

            {/* Header Section */}
            <img src="/societea.png" alt="SocieTea Logo" className="h-20 w-auto mb-6 drop-shadow-lg" />

            <h1 className="text-3xl font-bold text-white tracking-tight text-center mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-400 text-sm text-center mb-8">
              Login to access your campus community
            </p>

            {/* Google Button Container */}
            <div id="google-login-btn" className="w-full flex justify-center [&>div]:!w-full [&>div>iframe]:!w-full scale-[1.02] transform transition-transform hover:scale-[1.03]"></div>

            {errorMessage && (
              <div className="w-full mt-4 bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-start gap-2 animate-fade-in">
                <p className="text-red-400 text-xs font-medium text-center w-full">
                  {errorMessage}
                </p>
              </div>
            )}

            {/* Divider */}
            <div className="w-full flex items-center gap-4 my-6 opacity-40">
              <div className="h-px bg-gradient-to-r from-transparent via-white to-transparent flex-1"></div>
              <span className="text-[10px] tracking-[0.2em] text-white font-medium uppercase">OR</span>
              <div className="h-px bg-gradient-to-r from-transparent via-white to-transparent flex-1"></div>
            </div>

            {/* New User Button */}
            <button
              onClick={() => router.push('/college-selection')}
              className="group w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/20 rounded-2xl text-sm font-medium text-white transition-all duration-300 flex items-center justify-center gap-2 hover:shadow-indigo-500/40 hover:-translate-y-0.5"
            >
              <span>New user? Sign up here</span>
              <ArrowRight className="h-4 w-4 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </button>

          </div>

        </div>

        <div className="mt-8 text-center opacity-40 hover:opacity-80 transition-opacity">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white font-medium">
            Secure Authentication
          </p>
        </div>

      </div>
    </div>
  );

}
