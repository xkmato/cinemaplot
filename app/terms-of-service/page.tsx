
import Link from "next/link";

export default function TermsOfService() {
    return (
        <main className="container mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold mb-4">Terms of Service</h1>
            <p className="mb-2">Welcome to cinemaplot.com. By using our service, you agree to the following terms:</p>
            <ul className="list-disc pl-6 mb-4">
                <li>You must be at least 13 years old to use this service.</li>
                <li>Your data is protected and will not be sold or shared except as required by law.</li>
                <li>You are responsible for the content you upload and must not violate any laws or third-party rights.</li>
                <li>We reserve the right to suspend or terminate accounts for misuse or violation of these terms.</li>
                <li>Service is provided &quot;as is&quot; without warranties of any kind.</li>
            </ul>
            <p>If you have questions, contact us at hello@uvotamstudio.com.</p>
            <div className="mt-8">
                <Link href="/" className="inline-block">
                    <button className="bg-primary text-white px-4 py-2 rounded shadow hover:bg-primary-dark transition-colors">
                        Back to Home
                    </button>
                </Link>
            </div>
        </main>
    );
}
