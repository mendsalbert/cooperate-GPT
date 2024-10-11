import { Check } from "lucide-react";

const plans = [
  {
    name: "Basic",
    price: "$19",
    features: [
      "Register up to 10 pieces of content per month",
      "Basic smart contract licensing",
      "Content hash storage on blockchain",
      "API access for AI usage verification",
      "Community support",
    ],
  },
  {
    name: "Pro",
    price: "$49",
    features: [
      "Register up to 100 pieces of content per month",
      "Advanced smart contract licensing options",
      "Content hash and metadata storage",
      "Priority API access for AI usage verification",
      "Automated royalty distribution",
      "Email support",
    ],
  },
  {
    name: "Enterprise",
    price: "Custom",
    features: [
      "Unlimited content registration",
      "Custom smart contract development",
      "Advanced metadata and analytics",
      "Dedicated API endpoints",
      "Integration support for AI applications",
      "24/7 dedicated support",
      "Custom blockchain solutions",
    ],
  },
];

export default function PricingContent() {
  return (
    <div className="grid md:grid-cols-3 gap-8">
      {plans.map((plan) => (
        <div
          key={plan.name}
          className="border border-gray-200 rounded-lg p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white"
        >
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            {plan.name}
          </h2>
          <p className="text-4xl font-bold mb-6 text-gray-900">
            {plan.price}
            <span className="text-sm font-normal text-gray-600">
              {plan.price !== "Custom" && "/month"}
            </span>
          </p>
          <ul className="space-y-3 mb-8">
            {plan.features.map((feature) => (
              <li key={feature} className="flex items-center">
                <Check
                  className="text-green-500 mr-2 flex-shrink-0"
                  size={20}
                />
                <span className="text-sm text-gray-600">{feature}</span>
              </li>
            ))}
          </ul>
          <button className="w-full bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 transition-colors duration-300">
            {plan.price === "Custom" ? "Contact Sales" : "Get Started"}
          </button>
        </div>
      ))}
    </div>
  );
}
