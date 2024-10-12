'use client'
import SignUpForm from "../components/SignUpForm";

export default function SignUpPage() {
  return (
    <div className="container mx-auto px-6 py-12">
      <h1 className="text-3xl font-semibold mb-6 text-center">Sign Up</h1>
      <SignUpForm />
    </div>
  );
}
