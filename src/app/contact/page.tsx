"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, Send, MessageSquare } from "lucide-react";
import { PlatformFooter } from "@/components/platform/platform-footer";
import { PlatformNavbar } from "@/components/platform/platform-navbar";



export default function ContactUsPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Mimic API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <PlatformNavbar />
      <div className="relative overflow-hidden bg-slate-900 px-6 pt-32 pb-40 text-white sm:px-12 lg:pt-44 lg:pb-56">



        <div className="relative mx-auto max-w-4xl text-center">
          <span className="mb-4 inline-block rounded-full bg-slate-800 px-4 py-1.5 text-sm font-semibold text-slate-300">
            Get in touch
          </span>
          <h1 className="mb-6 text-4xl font-extrabold tracking-tight sm:text-6xl">
            How can we help?
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-slate-300 leading-relaxed">
            Have a question about our platform, security, or anything else? Our team is here to help you build your dream store.
          </p>
        </div>
        
        {/* Background blobs */}
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 blur-3xl opacity-20">
            <div className="h-64 w-64 rounded-full bg-indigo-500"></div>
        </div>
        <div className="absolute bottom-0 left-0 translate-y-24 -translate-x-12 blur-3xl opacity-10">
            <div className="h-80 w-80 rounded-full bg-teal-500"></div>
        </div>
      </div>

      <div className="relative mx-auto max-w-7xl px-6 pb-20 lg:px-8 z-10">
        <div className="grid gap-12 lg:grid-cols-[1fr_400px]">
          {/* Contact Form */}
          <div className="-mt-20 rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-8 lg:-mt-40 lg:p-12">


            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-bold text-slate-700">Name</label>
                    <input
                      required
                      type="text"
                      id="name"
                      placeholder="Your name"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 outline-none transition focus:border-slate-900"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-bold text-slate-700">Email address</label>
                    <input
                      required
                      type="email"
                      id="email"
                      placeholder="your@email.com"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 outline-none transition focus:border-slate-900"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="subject" className="text-sm font-bold text-slate-700">Subject</label>
                  <input
                    required
                    type="text"
                    id="subject"
                    placeholder="How can we help?"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 outline-none transition focus:border-slate-900"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-bold text-slate-700">Message</label>
                  <textarea
                    required
                    id="message"
                    rows={6}
                    placeholder="Tell us more about your inquiry..."
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 outline-none transition focus:border-slate-900"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  />
                </div>
                <button
                  disabled={isSubmitting}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-8 py-4 text-lg font-bold text-white transition hover:bg-slate-800 disabled:opacity-50 sm:w-auto"
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                  <Send size={18} />
                </button>
              </form>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-teal-100 text-teal-600">
                  <Send size={30} />
                </div>
                <h3 className="mb-2 text-2xl font-bold text-slate-900">Message sent!</h3>
                <p className="text-slate-500">We've received your request and will get back to you within 24 hours.</p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-8 font-bold text-slate-900 underline underline-offset-4"
                >
                  Send another message
                </button>
              </div>
            )}
          </div>

          {/* Contact Details */}
          <div className="space-y-10 pt-4 lg:pt-12">
            <div>
                <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-slate-900">
                   <MessageSquare size={20} className="text-slate-400" />
                    Contact Information
                </h3>
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1">

                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white shadow-md text-slate-600">
                    <Mail size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Email us</p>
                    <p className="text-lg font-semibold text-slate-800">polaristechsol@gmail.com</p>

                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white shadow-md text-slate-600">
                    <Phone size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Call us</p>
                    <p className="text-lg font-semibold text-slate-800">647-920-5920</p>

                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white shadow-md text-slate-600">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Visit us</p>
                    <p className="text-lg font-semibold text-slate-800">
                      Polaris Tech Sol <br />
                      7 Upper Mercer Street, Kitchener <br />
                      Ontario, N2A0B9 <br />
                      Canada
                    </p>

                  </div>
                </div>
              </div>
            </div>
            
            <div className="rounded-3xl bg-slate-900 p-8 text-white">
                <h4 className="mb-3 text-lg font-bold">Frequently Asked Questions</h4>
                <p className="mb-6 text-sm text-slate-400">Find quick answers to common questions about our platform and billing.</p>
                <Link href="#" className="inline-flex items-center gap-2 text-sm font-bold text-white underline underline-offset-4">
                    Visit Support Center
                </Link>
            </div>
          </div>
        </div>
      </div>
      <PlatformFooter />
    </div>
  );
}

