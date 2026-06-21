import { prisma } from "../../lib/prisma";

const email = process.argv[2];

if (!email) {
  console.error("❌ Error: Email address required");
  console.log("");
  console.log("Usage:");
  console.log("  npx ts-node scripts/make-admin.ts <email>");
  console.log("");
  console.log("Example:");
  console.log("  npx ts-node scripts/make-admin.ts admin@example.com");
  process.exit(1);
}

async function makeAdmin() {
  try {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, role: true, name: true },
    });

    if (!existingUser) {
      console.error(`❌ Error: No user found with email: ${email}`);
      console.log("");
      console.log("The user must sign in at least once before being made an admin.");
      process.exit(1);
    }

    if (existingUser.role === "admin") {
      console.log(`ℹ️  User ${email} is already an admin.`);
      process.exit(0);
    }

    // Update user to admin
    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        role: "admin",
        approvedAt: new Date(),
      },
    });

    console.log("");
    console.log("✅ SUCCESS!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`👤 Name:     ${updatedUser.name || "N/A"}`);
    console.log(`📧 Email:    ${updatedUser.email}`);
    console.log(`👑 Role:     ${updatedUser.role}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("");
    console.log("🛠️  The user can now access the admin dashboard at:");
    console.log("   http://localhost:3000/admin");
    console.log("");
    console.log("⚠️  Note: The user may need to log out and log back in.");
    console.log("");
  } catch (error) {
    console.error("❌ Error updating user:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

makeAdmin();
