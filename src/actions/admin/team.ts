"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guards";
import {
  teamMemberSchema,
  teamReorderSchema,
  teamToggleSchema,
  type TeamMemberInput,
} from "@/schemas/admin";
import {
  failure,
  isUniqueViolation,
  ok,
  safeAdminQuery,
  toFieldErrors,
  type ActionResult,
} from "@/actions/admin/shared";

function revalidateTeam() {
  revalidatePath("/admin/team");
  revalidatePath("/admin/dashboard");
  revalidatePath("/about-us");
  revalidatePath("/");
}

export async function saveTeamMemberAction(
  id: string | null,
  values: TeamMemberInput,
): Promise<ActionResult> {
  await requireAdmin();

  const parsed = teamMemberSchema.safeParse(values);
  if (!parsed.success) {
    return failure("Please fix the highlighted fields.", toFieldErrors(parsed.error));
  }

  const t = parsed.data;
  const data = {
    name: t.name,
    slug: t.slug,
    role: t.role,
    bio: t.bio || null,
    image: t.image || null,
    imageAlt: t.imageAlt || null,
    isFounder: t.isFounder,
    socials: t.socials,
    order: Number(t.order),
    published: t.published,
  };

  try {
    if (id) {
      const existing = await prisma.teamMember.findUnique({
        where: { id },
        select: { id: true, slug: true },
      });
      if (!existing) {
        return failure("That team member no longer exists.");
      }

      if (t.isFounder) {
        // One founder only: unset the others first, then save this row.
        await prisma.$transaction([
          prisma.teamMember.updateMany({
            where: { isFounder: true, id: { not: id } },
            data: { isFounder: false },
          }),
          prisma.teamMember.update({ where: { id }, data }),
        ]);
      } else {
        await prisma.teamMember.update({ where: { id }, data });
      }
      revalidateTeam();
      return ok(`Updated “${t.name}”.`);
    }

    if (t.isFounder) {
      await prisma.$transaction([
        prisma.teamMember.updateMany({
          where: { isFounder: true },
          data: { isFounder: false },
        }),
        prisma.teamMember.create({ data }),
      ]);
    } else {
      await prisma.teamMember.create({ data });
    }
    revalidateTeam();
    return ok(`Created “${t.name}”.`);
  } catch (error) {
    if (isUniqueViolation(error)) {
      return failure("That slug is already used by another team member.", {
        slug: ["This slug is already taken"],
      });
    }
    return failure("We couldn't save that team member. Please try again.");
  }
}

export async function deleteTeamMemberAction(id: string): Promise<ActionResult> {
  await requireAdmin();

  try {
    const existing = await prisma.teamMember.findUnique({
      where: { id },
      select: { id: true, name: true },
    });
    if (!existing) {
      return failure("That team member no longer exists.");
    }
    await prisma.teamMember.delete({ where: { id } });
    revalidateTeam();
    return ok(`Deleted “${existing.name}”.`);
  } catch {
    return failure("We couldn't delete that team member. Please try again.");
  }
}

/** Rewrite display order from a full list of ids (new order, first = top). */
export async function reorderTeamMemberAction(
  ids: string[],
): Promise<ActionResult> {
  await requireAdmin();

  const parsed = teamReorderSchema.safeParse({ ids });
  if (!parsed.success) {
    return failure("Please fix the highlighted fields.", toFieldErrors(parsed.error));
  }

  try {
    const rows = await prisma.teamMember.findMany({ select: { id: true } });
    const known = new Set(rows.map((row) => row.id));
    if (parsed.data.ids.some((rowId) => !known.has(rowId))) {
      return failure("The team list changed — refresh the page and try again.");
    }

    await prisma.$transaction(
      parsed.data.ids.map((rowId, index) =>
        prisma.teamMember.update({
          where: { id: rowId },
          data: { order: index },
        }),
      ),
    );
    revalidateTeam();
    return ok("Order updated.");
  } catch {
    return failure("We couldn't reorder the team. Please try again.");
  }
}

/** Flip `published` or `isFounder` — the founder flag auto-unsets others. */
export async function toggleTeamMemberAction(
  id: string,
  field: "published" | "isFounder",
): Promise<ActionResult> {
  await requireAdmin();

  const parsed = teamToggleSchema.safeParse({ id, field });
  if (!parsed.success) {
    return failure("Please fix the highlighted fields.", toFieldErrors(parsed.error));
  }
  const { id: memberId, field: target } = parsed.data;

  try {
    const existing = await prisma.teamMember.findUnique({
      where: { id: memberId },
      select: { id: true, name: true, published: true, isFounder: true },
    });
    if (!existing) {
      return failure("That team member no longer exists.");
    }

    if (target === "published") {
      const next = !existing.published;
      await prisma.teamMember.update({
        where: { id: memberId },
        data: { published: next },
      });
      revalidateTeam();
      return ok(next ? `Published “${existing.name}”.` : `Unpublished “${existing.name}”.`);
    }

    const next = !existing.isFounder;
    if (next) {
      await prisma.$transaction([
        prisma.teamMember.updateMany({
          where: { isFounder: true, id: { not: memberId } },
          data: { isFounder: false },
        }),
        prisma.teamMember.update({
          where: { id: memberId },
          data: { isFounder: true },
        }),
      ]);
    } else {
      await prisma.teamMember.update({
        where: { id: memberId },
        data: { isFounder: false },
      });
    }
    revalidateTeam();
    return ok(
      next
        ? `“${existing.name}” is now the founder.`
        : `“${existing.name}” is no longer the founder.`,
    );
  } catch {
    return failure("We couldn't update that team member. Please try again.");
  }
}

/** Read one team member for the edit form. */
export async function getTeamMemberForEdit(id: string) {
  await requireAdmin();
  return safeAdminQuery(
    `team.edit:${id}`,
    () => prisma.teamMember.findUnique({ where: { id } }),
    null,
  );
}
