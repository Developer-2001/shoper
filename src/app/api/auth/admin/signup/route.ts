import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";
import { adminSignupSchema } from "@/lib/validators";
import { connectDB } from "@/lib/db";
import { AdminModel } from "@/models/Admin";
import { StoreModel } from "@/models/Store";
import { errorResponse, successResponse } from "@/lib/response";
import { AUTH_COOKIES, authCookieOptions, signAuthToken } from "@/lib/auth";
import { slugify, uniqueSlug } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = adminSignupSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse("Invalid signup data", 422, parsed.error.flatten());
    }

    await connectDB();

    const payload = {
      ...parsed.data,
      businessEmail: parsed.data.businessEmail.toLowerCase(),
    };

    const existingAdmin = await AdminModel.findOne({
      businessEmail: payload.businessEmail,
    });

    if (existingAdmin) {
      return errorResponse("Admin account already exists with this email", 409);
    }

    const baseSlug = slugify(payload.businessName) || uniqueSlug("store");
    let finalSlug = baseSlug;

    while (await StoreModel.exists({ slug: finalSlug })) {
      finalSlug = uniqueSlug(baseSlug);
    }

    const store = await StoreModel.create({
      slug: finalSlug,
      businessName: payload.businessName,
      businessEmail: payload.businessEmail,
      ownerName: payload.ownerName,
      mobile: payload.mobile,
      currency: payload.currency,
      contactEmail: payload.businessEmail,
      contactMobile: payload.mobile,
      address: "",
      about: "",
      logo: "",
    });

    const passwordHash = await bcrypt.hash(payload.password, 10);

    const admin = await AdminModel.create({
      storeId: store._id,
      ownerName: payload.ownerName,
      businessEmail: payload.businessEmail,
      mobile: payload.mobile,
      businessName: payload.businessName,
      currency: payload.currency,
      passwordHash,
    });

    const token = signAuthToken({
      userId: String(admin._id),
      role: "admin",
      storeId: String(store._id),
      email: payload.businessEmail,
      mobile: payload.mobile,
    });

    const response = successResponse(
      {
        admin: {
          _id: String(admin._id),
          ownerName: admin.ownerName,
          businessEmail: admin.businessEmail,
          mobile: admin.mobile,
          businessName: admin.businessName,
          currency: admin.currency,
          storeId: String(store._id),
        },
        store: {
          _id: String(store._id),
          slug: store.slug,
          businessName: store.businessName,
          currency: store.currency,
        },
      },
      201,
    );

    response.cookies.set(AUTH_COOKIES.admin, token, authCookieOptions);
    return response;
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : "Unable to create admin account",
      500,
    );
  }
}
