import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { components } from "../_generated/api";

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  }
});

export const sendImage = mutation({
  args: {
    storageId: v.id("_storage"),
    type: v.union(v.literal("profile"), v.literal("organization"))
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    let id;
    if (args.type === "organization") {
      const activeOrganization = await ctx.runQuery(
        components.betterAuth.lib.getCurrentSession
      );
      if (!activeOrganization?.activeOrganizationId) {
        throw new Error("No active organization");
      }
      id = activeOrganization.activeOrganizationId;
    } else {
      id = identity.subject;
    }

    await ctx.db.insert("files", {
      body: args.storageId,
      userId: id,
      format: "image",
      type: args.type
    });
  }
});

export const getUserLogo = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const userLogo = await ctx.db
      .query("files")
      .filter((q) => q.eq(q.field("type"), "profile"))
      .filter((q) => q.eq(q.field("userId"), identity.subject))
      .first();

    if (userLogo?.format === "image") {
      const url = await ctx.storage.getUrl(userLogo.body);
      return { url, storageId: userLogo._id };
    }
    return null;
  }
});

export const getOrganizationLogo = query({
  args: {},
  handler: async (ctx) => {
    const activeOrganization = await ctx.runQuery(
      components.betterAuth.lib.getCurrentSession
    );

    if (activeOrganization?.activeOrganizationId) {
      const organizationLogo = await ctx.db
        .query("files")
        .filter((q) => q.eq(q.field("type"), "organization"))
        .filter((q) =>
          q.eq(q.field("userId"), activeOrganization.activeOrganizationId)
        )
        .first();
      if (organizationLogo?.format === "image") {
        const url = await ctx.storage.getUrl(organizationLogo.body);
        return { url, storageId: organizationLogo._id };
      }
    }

    return null;
  }
});

export const deleteById = mutation({
  args: {
    fileId: v.id("files")
  },
  handler: async (ctx, args) => {
    const file = await ctx.db.get(args.fileId);
    if (!file) {
      throw new Error("File not found");
    }
    await ctx.storage.delete(file.body);
    return await ctx.db.delete(args.fileId);
  }
});
