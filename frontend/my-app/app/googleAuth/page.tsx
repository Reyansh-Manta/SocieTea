'use client';

import { useEffect } from 'react';

export default function GoogleLoginButton() {

  async function handleCredentialResponse(response: any) {
    const googleIdToken = response.credential;

    const res = await fetch(
      'http://localhost:9000/api/v1/user/googleAuth',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_token: googleIdToken }),
      }
    );

    const data = await res.json();
    console.log(data);
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
        shape: 'rectangular',
      }
    );

    clearInterval(interval);
  }, 100);

  return () => clearInterval(interval);
}, []);


  return <div id="google-login-btn"></div>;
  
}
