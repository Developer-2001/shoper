import React from 'react';
import { PlatformFooter } from "@/components/platform/platform-footer";
import { PlatformNavbar } from "@/components/platform/platform-navbar";


export default function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_10%_20%,#cffafe_0%,#ffffff_35%,#f8fafc_70%)] text-slate-900">
      <PlatformNavbar />
      <div className="mx-auto max-w-4xl px-6 pb-20 pt-32 lg:px-8 lg:pt-40">


        <h1 className="mb-10 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
          Terms & Conditions
        </h1>
        
        <div className="prose prose-slate max-w-none prose-headings:text-slate-900 prose-p:text-slate-600 prose-li:text-slate-600">
          <p className="text-lg leading-8 text-slate-600">
            Last updated: March 25, 2026
          </p>

          <section className="mt-12">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">1. Agreement to Terms</h2>
            <p className="mt-4">
              These Terms & Conditions constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("you") and Shoper ("we," "us," or "our"), concerning your access to and use of the Shoper website as well as any other media form, media channel, mobile website or mobile application related, linked, or otherwise connected thereto (collectively, the "Site").
            </p>
          </section>

          <section className="mt-12">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">2. Intellectual Property Rights</h2>
            <p className="mt-4">
              Unless otherwise indicated, the Site is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Site (collectively, the "Content") and the trademarks, service marks, and logos contained therein (the "Marks") are owned or controlled by us or licensed to us, and are protected by copyright and trademark laws and various other intellectual property rights.
            </p>
          </section>

          <section className="mt-12">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">3. User Representations</h2>
            <p className="mt-4">
              By using the Site, you represent and warrant that: (1) all registration information you submit will be true, accurate, current, and complete; (2) you will maintain the accuracy of such information and promptly update such registration information as necessary.
            </p>
          </section>

          <section className="mt-12">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">4. Prohibited Activities</h2>
            <p className="mt-4">
              You may not access or use the Site for any purpose other than that for which we make the Site available. The Site may not be used in connection with any commercial endeavors except those that are specifically endorsed or approved by us.
            </p>
          </section>

          <section className="mt-12">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">5. Termination</h2>
            <p className="mt-4">
              We reserve the right to terminate your access to the Site at any time, without notice, for conduct that we believe violates these Terms & Conditions or is harmful to other users of the Site, us, or third parties, or for any other reason.
            </p>
          </section>

          <section className="mt-12 border-t border-slate-100 pt-10">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Contact Us</h2>
            <p className="mt-4">
              In order to resolve a complaint regarding the Site or to receive further information regarding use of the Site, please contact us at:
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

