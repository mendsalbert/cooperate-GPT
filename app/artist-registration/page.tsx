import ArtistOnboarding from "../components/ArtistOnboarding";

export default function ArtistRegistrationPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 bg-gray-50 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <ArtistOnboarding />
      </div>
    </div>
  );
}
