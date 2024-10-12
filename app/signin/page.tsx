"use client";
import SignInForm from "../components/SignInForm";

export default function SignInPage() {
  return (
    <div className="container mx-auto px-6 py-12">
      <h1 className="text-3xl font-semibold mb-6 text-center">Sign In</h1>
      <SignInForm />
    </div>
  );
}
