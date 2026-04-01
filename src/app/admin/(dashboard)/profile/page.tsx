"use client";

import { FormEvent, useEffect, useState } from "react";
import { Eye, EyeOff, Pencil } from "lucide-react";

import { AdminTopbar } from "@/components/admin/admin-topbar";
import { Spinner } from "@/components/admin/ui/loader";
import { Skeleton } from "@/components/admin/ui/skeleton";

type ProfileData = {
  ownerName: string;
  email: string;
  mobile: string;
  businessName: string;
  slug: string;
};

type MessageState = {
  type: "success" | "error";
  text: string;
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<MessageState | null>(
    null
  );
  const [passwordMessage, setPasswordMessage] = useState<MessageState | null>(
    null
  );
  const [changingPassword, setChangingPassword] = useState(false);
  const [editForm, setEditForm] = useState({
    ownerName: "",
    businessName: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch("/api/auth/me");
        if (!response.ok) {
          setError("Failed to load profile. Please sign in again.");
          return;
        }

        const data = await response.json();
        if (!data.admin || !data.store) {
          setError("Failed to load profile. Please sign in again.");
          return;
        }

        const nextProfile = {
          ownerName: data.admin.ownerName,
          email: data.admin.email,
          mobile: data.admin.mobile,
          businessName: data.store.businessName,
          slug: data.store.slug,
        };

        setProfile(nextProfile);
        setEditForm({
          ownerName: nextProfile.ownerName,
          businessName: nextProfile.businessName,
        });
      } catch (err) {
        console.error(err);
        setError("A network error occurred.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  function startEditMode() {
    if (!profile) return;

    setProfileMessage(null);
    setEditForm({
      ownerName: profile.ownerName,
      businessName: profile.businessName,
    });
    setMode("edit");
  }

  function cancelEditMode() {
    if (!profile) return;

    setProfileMessage(null);
    setEditForm({
      ownerName: profile.ownerName,
      businessName: profile.businessName,
    });
    setMode("view");
  }

  async function handleProfileSave(event: FormEvent) {
    event.preventDefault();
    if (!profile) return;

    setProfileMessage(null);

    const payload = {
      ownerName: editForm.ownerName.trim(),
      businessName: editForm.businessName.trim(),
    };

    if (payload.ownerName.length < 2) {
      setProfileMessage({
        type: "error",
        text: "Owner name must be at least 2 characters.",
      });
      return;
    }

    if (payload.businessName.length < 2) {
      setProfileMessage({
        type: "error",
        text: "Business name must be at least 2 characters.",
      });
      return;
    }

    setSavingProfile(true);
    try {
      const response = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (!response.ok) {
        setProfileMessage({
          type: "error",
          text: data.error || "Failed to update profile.",
        });
        return;
      }

      const updatedProfile = {
        ownerName: data.admin.ownerName,
        email: data.admin.email,
        mobile: data.admin.mobile,
        businessName: data.store.businessName,
        slug: data.store.slug,
      };

      setProfile(updatedProfile);
      setEditForm({
        ownerName: updatedProfile.ownerName,
        businessName: updatedProfile.businessName,
      });
      setMode("view");
      setProfileMessage({ type: "success", text: "Profile updated successfully." });
    } catch (saveError) {
      console.error(saveError);
      setProfileMessage({
        type: "error",
        text: "Network error while saving profile.",
      });
    } finally {
      setSavingProfile(false);
    }
  }

  async function handlePasswordChange(event: FormEvent) {
    event.preventDefault();
    setPasswordMessage(null);

    if (passwordForm.newPassword.length < 6) {
      setPasswordMessage({
        type: "error",
        text: "New password must be at least 6 characters.",
      });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage({
        type: "error",
        text: "Confirm password does not match.",
      });
      return;
    }

    setChangingPassword(true);
    try {
      const response = await fetch("/api/admin/profile/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(passwordForm),
      });
      const data = await response.json();

      if (!response.ok) {
        setPasswordMessage({
          type: "error",
          text: data.error || "Failed to change password.",
        });
        return;
      }

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordMessage({ type: "success", text: "Password changed successfully." });
    } catch (saveError) {
      console.error(saveError);
      setPasswordMessage({
        type: "error",
        text: "Network error while changing password.",
      });
    } finally {
      setChangingPassword(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-slate-300 px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200";
  const passwordInputClass = `${inputClass} pr-10`;

  return (
    <div>
      <AdminTopbar title="Profile" subtitle="Your account and store identity." />

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
          <p className="font-semibold">{error}</p>
        </div>
      ) : loading || !profile ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-6 w-1/2" />
        </div>
      ) : (
        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Profile Details</h2>
                <p className="text-sm text-slate-500">
                  Manage your account Information.
                </p>
              </div>

              {mode === "view" ? (
                <button
                  type="button"
                  onClick={startEditMode}
                  className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                >
                  <Pencil size={16} /> Edit
                </button>
              ) : null}
            </div>

            {profileMessage ? (
              <div
                className={`mb-4 rounded-xl border px-4 py-3 text-sm ${
                  profileMessage.type === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-red-200 bg-red-50 text-red-700"
                }`}
              >
                {profileMessage.text}
              </div>
            ) : null}

            {mode === "view" ? (
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold text-slate-500">Owner Name</p>
                  <p className="mt-1 text-sm font-medium text-slate-900">{profile.ownerName}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold text-slate-500">Business Name</p>
                  <p className="mt-1 text-sm font-medium text-slate-900">
                    {profile.businessName}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold text-slate-500">Email</p>
                  <p className="mt-1 text-sm font-medium text-slate-900">{profile.email}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold text-slate-500">Mobile</p>
                  <p className="mt-1 text-sm font-medium text-slate-900">{profile.mobile}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 sm:col-span-2">
                  <p className="text-xs font-semibold text-slate-500">Store URL</p>
                  <p className="mt-1 text-sm font-medium text-slate-900">/{profile.slug}</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleProfileSave} className="space-y-4">
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="ownerName" className="text-sm font-semibold text-slate-700">
                      Owner Name
                    </label>
                    <input
                      id="ownerName"
                      value={editForm.ownerName}
                      onChange={(event) =>
                        setEditForm((prev) => ({ ...prev, ownerName: event.target.value }))
                      }
                      className={inputClass}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="businessName"
                      className="text-sm font-semibold text-slate-700"
                    >
                      Business Name
                    </label>
                    <input
                      id="businessName"
                      value={editForm.businessName}
                      onChange={(event) =>
                        setEditForm((prev) => ({ ...prev, businessName: event.target.value }))
                      }
                      className={inputClass}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-semibold text-slate-700">
                      Email
                    </label>
                    <input
                      id="email"
                      value={profile.email}
                      className={`${inputClass} bg-slate-100 text-slate-500`}
                      disabled
                    />
                    <p className="text-xs text-slate-500">
                      Email cannot be changed from profile.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="mobile" className="text-sm font-semibold text-slate-700">
                      Mobile
                    </label>
                    <input
                      id="mobile"
                      value={profile.mobile}
                      className={`${inputClass} bg-slate-100 text-slate-500`}
                      disabled
                    />
                    <p className="text-xs text-slate-500">
                      Mobile cannot be changed from profile.
                    </p>
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <label htmlFor="slug" className="text-sm font-semibold text-slate-700">
                      Store URL Slug
                    </label>
                    <div className="flex items-center rounded-xl border border-slate-300 px-4 py-2 focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-slate-200">
                      <span className="text-sm text-slate-500">/</span>
                      <input
                        id="slug"
                        value={profile.slug}
                        className="ml-1 w-full bg-transparent text-sm text-slate-500 outline-none"
                        disabled
                      />
                    </div>
                    <p className="text-xs text-slate-500">
                      Store URL slug cannot be changed.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2 font-semibold text-white disabled:opacity-50"
                  >
                    {savingProfile ? <Spinner size={16} className="text-white" /> : null}
                    {savingProfile ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    onClick={cancelEditMode}
                    className="rounded-xl border border-slate-300 px-5 py-2 font-semibold text-slate-700"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-bold text-slate-900">Change Password</h2>
            <p className="mt-1 text-sm text-slate-500">
              For security, enter your current password before setting a new one.
            </p>

            {passwordMessage ? (
              <div
                className={`mt-4 rounded-xl border px-4 py-3 text-sm ${
                  passwordMessage.type === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-red-200 bg-red-50 text-red-700"
                }`}
              >
                {passwordMessage.text}
              </div>
            ) : null}

            <form onSubmit={handlePasswordChange} className="mt-4 space-y-4">
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
                <div className="space-y-2">
                  <label
                    htmlFor="currentPassword"
                    className="text-sm font-semibold text-slate-700"
                  >
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      id="currentPassword"
                      type={showPassword.currentPassword ? "text" : "password"}
                      value={passwordForm.currentPassword}
                      onChange={(event) =>
                        setPasswordForm((prev) => ({
                          ...prev,
                          currentPassword: event.target.value,
                        }))
                      }
                      className={passwordInputClass}
                      required
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword((prev) => ({
                          ...prev,
                          currentPassword: !prev.currentPassword,
                        }))
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                      aria-label={
                        showPassword.currentPassword
                          ? "Hide current password"
                          : "Show current password"
                      }
                    >
                      {showPassword.currentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="newPassword" className="text-sm font-semibold text-slate-700">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      id="newPassword"
                      type={showPassword.newPassword ? "text" : "password"}
                      value={passwordForm.newPassword}
                      onChange={(event) =>
                        setPasswordForm((prev) => ({
                          ...prev,
                          newPassword: event.target.value,
                        }))
                      }
                      className={passwordInputClass}
                      required
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword((prev) => ({
                          ...prev,
                          newPassword: !prev.newPassword,
                        }))
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                      aria-label={
                        showPassword.newPassword
                          ? "Hide new password"
                          : "Show new password"
                      }
                    >
                      {showPassword.newPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="confirmPassword"
                    className="text-sm font-semibold text-slate-700"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showPassword.confirmPassword ? "text" : "password"}
                      value={passwordForm.confirmPassword}
                      onChange={(event) =>
                        setPasswordForm((prev) => ({
                          ...prev,
                          confirmPassword: event.target.value,
                        }))
                      }
                      className={passwordInputClass}
                      required
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword((prev) => ({
                          ...prev,
                          confirmPassword: !prev.confirmPassword,
                        }))
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                      aria-label={
                        showPassword.confirmPassword
                          ? "Hide confirm password"
                          : "Show confirm password"
                      }
                    >
                      {showPassword.confirmPassword ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={changingPassword}
                className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2 font-semibold text-white disabled:opacity-50"
              >
                {changingPassword ? <Spinner size={16} className="text-white" /> : null}
                {changingPassword ? "Updating..." : "Change Password"}
              </button>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
