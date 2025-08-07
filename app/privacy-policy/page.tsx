
import Link from "next/link";

export default function PrivacyPolicy() {
    return (
        <main className="container mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
            <p className="mb-2">Your privacy is important to us. This policy explains how we handle your information:</p>
            <ul className="list-disc pl-6 mb-4">
                <li>We collect only the data necessary to provide our services.</li>
                <li>Your data is stored securely and is not shared with third parties except as required by law.</li>
                <li>You may request deletion of your account and data at any time.</li>
                <li>We use cookies and analytics to improve user experience.</li>
                <li>Contact us at hello@uvotamstudi.com for privacy-related questions.</li>
            </ul>
            <p>By using cinemaplot.com, you consent to this privacy policy.</p>
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
