import React from 'react';
import { PlatformFooter } from "@/components/platform/platform-footer";
import { PlatformNavbar } from "@/components/platform/platform-navbar";


export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_10%_20%,#cffafe_0%,#ffffff_35%,#f8fafc_70%)] text-slate-900">
      <PlatformNavbar />
      <div className="mx-auto max-w-4xl px-6 pb-20 pt-32 lg:px-8 lg:pt-40">


        <h1 className="mb-10 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
          Privacy Policy
        </h1>
        
        <div className="prose prose-slate max-w-none prose-headings:text-slate-900 prose-p:text-slate-600 prose-li:text-slate-600">
          <p className="text-lg leading-8 text-slate-600">
            Last updated: March 25, 2026
          </p>

          <section className="mt-12">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">1. Introduction</h2>
            <p className="mt-4">
              Welcome to Shoper ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about our policy, or our practices with regards to your personal information, please contact us at polaristechsol@gmail.com.
            </p>
          </section>

          <section className="mt-12">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">2. Information We Collect</h2>
            <p className="mt-4">
              We collect personal information that you voluntarily provide to us when you register on the Website, express an interest in obtaining information about us or our products and Services, when you participate in activities on the Website or otherwise when you contact us.
            </p>
            <ul className="mt-4 list-inside list-disc space-y-2">
              <li><strong>Personal Information Provided by You:</strong> Names, phone numbers, email addresses, mailing addresses, usernames, passwords, contact preferences, and other similar information.</li>
              <li><strong>Payment Data:</strong> We may collect data necessary to process your payment if you make purchases, such as your payment instrument number (such as a credit card number), and the security code associated with your payment instrument.</li>
            </ul>
          </section>

          <section className="mt-12">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">3. How We Use Your Information</h2>
            <p className="mt-4">
              We use personal information collected via our Website for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations.
            </p>
            <ul className="mt-4 list-inside list-disc space-y-2">
              <li>To facilitate account creation and logon process.</li>
              <li>To send administrative information to you.</li>
              <li>To fulfill and manage your orders.</li>
              <li>To protect our Services.</li>
            </ul>
          </section>

          <section className="mt-12">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">4. Sharing Your Information</h2>
            <p className="mt-4">
              We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations.
            </p>
          </section>

          <section className="mt-12 border-t border-slate-100 pt-10">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Contact Us</h2>
            <p className="mt-4">
              If you have questions or comments about this policy, you may email us at polaristechsol@gmail.com or by post to:
            </p>
            <p className="mt-2 font-medium">
              Polaris Tech Sol<br />
              7 Upper Mercer Street, Kitchener<br />
              Ontario, N2A0B9<br />
              Canada
            </p>

          </section>
        </div>
      </div>
      <PlatformFooter />
    </div>
  );
}

