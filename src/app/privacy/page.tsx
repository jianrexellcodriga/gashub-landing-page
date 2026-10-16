'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto px-6 py-16 w-full">
        <h1 className="text-4xl font-bold mb-4 text-white">Privacy Policy</h1>
        <p className="text-gray-400 mb-10 text-sm">Last updated: May 2026</p>

        <section className="space-y-10 text-gray-300 leading-relaxed">
          <div>
            <h2 className="text-2xl font-semibold text-white mb-3">1. Introduction</h2>
            <p>
              Welcome to GasHub. We are committed to protecting your personal information and your
              right to privacy. This Privacy Policy explains how we collect, use, disclose, and
              safeguard your information when you use our application and services.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-white mb-3">2. Information We Collect</h2>
            <p className="mb-3">We may collect the following types of information:</p>
            <ul className="list-disc list-inside space-y-2 pl-2">
              <li>
                <span className="text-white font-medium">Location Data:</span> To show nearby gas
                stations and fuel prices, we collect your device&apos;s location with your
                permission.
              </li>
              <li>
                <span className="text-white font-medium">Usage Data:</span> Information about how
                you interact with the app, including pages visited and features used.
              </li>
              <li>
                <span className="text-white font-medium">User-Submitted Data:</span> Fuel price
                updates and reports you voluntarily submit through the app.
              </li>
              <li>
                <span className="text-white font-medium">Device Information:</span> Device type,
                operating system, and unique device identifiers.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-white mb-3">
              3. How We Use Your Information
            </h2>
            <p className="mb-3">We use the information we collect to:</p>
            <ul className="list-disc list-inside space-y-2 pl-2">
              <li>Provide, operate, and maintain our services</li>
              <li>Display accurate, real-time fuel prices near your location</li>
              <li>Improve and personalize your experience</li>
              <li>Analyze usage trends to enhance app performance</li>
              <li>Communicate updates, alerts, and support responses</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-white mb-3">4. Sharing Your Information</h2>
            <p>
              We do not sell, trade, or rent your personal information to third parties. We may
              share anonymized, aggregated data for analytical purposes. We may disclose information
              if required by law or to protect the rights and safety of our users.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-white mb-3">5. Data Retention</h2>
            <p>
              We retain your data only as long as necessary to provide our services or as required
              by law. You may request deletion of your account and associated data at any time by
              contacting us.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-white mb-3">6. Security</h2>
            <p>
              We implement industry-standard security measures to protect your information. However,
              no method of transmission over the internet or electronic storage is 100% secure. We
              strive to use commercially acceptable means to protect your data.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-white mb-3">7. Your Rights</h2>
            <p className="mb-3">Depending on your location, you may have the right to:</p>
            <ul className="list-disc list-inside space-y-2 pl-2">
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Opt out of certain data processing activities</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-white mb-3">8. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any
              significant changes by updating the date at the top of this page. Continued use of the
              app after changes constitutes your acceptance of the updated policy.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-white mb-3">9. Contact Us</h2>
            <p>
              If you have any questions or concerns about this Privacy Policy, please contact us at{' '}
              <a href="mailto:privacy@gashub.app" className="text-green-400 hover:underline">
                privacy@gashub.app
              </a>
              .
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
