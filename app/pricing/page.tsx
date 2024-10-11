import PricingContent from "../components/PricingContent";

export default function PricingPage() {
  return (
    <div className="container mx-auto px-7 py-16">
      <h1 className="text-4xl font-bold text-center mb-6">Pricing Plans</h1>
      <p className="text-xl text-center mb-12 text-gray-600">
        Secure your digital creations with blockchain-powered copyright
        protection
      </p>
      <PricingContent />
    </div>
  );
}
