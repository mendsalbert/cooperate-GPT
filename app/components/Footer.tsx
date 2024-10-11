import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#f9fafb] z-50 text-gray-700">
      <div className="container mx-auto px-9 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">About Blockrights</h3>
            <p className="text-sm">
              Blockrights is a platform for managing and protecting digital
              rights using blockchain technology.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/dashboard" className="text-sm hover:text-gray-900">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/licenses" className="text-sm hover:text-gray-900">
                  Licenses
                </Link>
              </li>
              <li>
                <Link href="/settings" className="text-sm hover:text-gray-900">
                  Settings
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <p className="text-sm">Email: blocklinklabs@gmail.com</p>
            <p className="text-sm">Phone: +233 24 910-7812</p>
          </div>
        </div>
        <div className="mt-8 pt-4 border-t border-gray-300 text-center">
          <p className="text-sm">
            &copy; {new Date().getFullYear()} Blockrights. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
