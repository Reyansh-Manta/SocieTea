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
          if (data.data.FullyRegistered == true) {
            router.push('/');
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
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center pb-24 relative overflow-hidden selection:bg-indigo-500/30">

      {/* Background Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-900/20 rounded-full blur-[120px]" />
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-blue-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] bg-purple-900/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-md px-6">

        {/* Logo area */}
        <div className="flex flex-col items-center mb-10 animate-fade-in">
          <img src="/societea.png" alt="SocieTea Logo" className="h-28 w-auto mb-0 drop-shadow-2xl" />
        </div>
        <div className="flex flex-col items-center mb-10 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-200 via-white to-indigo-200 tracking-tight text-center mb-3">
            Welcome Back
          </h1>
          <p className="text-gray-400 text-base text-center max-w-xs">
            Login to access your campus community
          </p>
        </div>

        {/* Glass Card */}
        <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-8 shadow-2xl backdrop-blur-2xl ring-1 ring-white/5 animate-slide-up hover:border-indigo-500/20 transition-all duration-500">

          <div className="flex flex-col items-center gap-6">
            {/* Google Button Container */}
            <div id="google-login-btn" className="w-full flex justify-center [&>div]:!w-full [&>div>iframe]:!w-full scale-105 transform transition-transform"></div>

            {errorMessage && (
              <div className="w-full bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-start gap-2 animate-fade-in">
                <p className="text-red-400 text-xs font-medium text-center w-full">
                  {errorMessage}
                </p>
              </div>
            )}

            <div className="w-full flex flex-col items-center gap-6 mt-4">
              <div className="w-full flex items-center gap-4 opacity-30">
                <div className="h-px bg-gradient-to-r from-transparent via-white to-transparent flex-1"></div>
                <span className="text-[10px] tracking-[0.2em] text-white font-medium uppercase">OR</span>
                <div className="h-px bg-gradient-to-r from-transparent via-white to-transparent flex-1"></div>
              </div>

              <button
                onClick={() => router.push('/college-selection')}
                className="group w-full py-4 bg-white/[0.05] hover:bg-white/[0.08] border border-white/10 hover:border-indigo-500/30 rounded-2xl text-sm font-medium text-gray-300 hover:text-white transition-all duration-300 flex items-center justify-center gap-3 backdrop-blur-md"
              >
                <span>New user? Sign up here</span>
                <ArrowRight className="h-4 w-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-indigo-400" />
              </button>
            </div>
          </div>

        </div>

        <div className="mt-8 text-center opacity-60 hover:opacity-100 transition-opacity">
          <p className="text-[10px] uppercase tracking-widest text-gray-500">
            Secure Authentication
          </p>
        </div>

      </div>
    </div>
  );

}
