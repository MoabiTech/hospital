"use strict";

const admin = require("firebase-admin");

const projectId = process.env.FIREBASE_PROJECT_ID || "hospital-45a70";
const email = "admin@carepoint.demo";
const name = process.env.CAREPOINT_ADMIN_NAME || "CarePoint Administrator";

if (process.argv.includes("--help")) {
  console.info(
    "Set GOOGLE_APPLICATION_CREDENTIALS to a trusted Firebase Admin SDK credential file. " +
    "Set CAREPOINT_ADMIN_PASSWORD only when creating the account, then run npm run bootstrap:admin."
  );
  process.exit(0);
}

async function main() {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId,
  });

  const auth = admin.auth();
  const db = admin.firestore();
  let user;

  try {
    user = await auth.getUserByEmail(email);
    console.info(`Found existing Firebase Authentication account for ${email}.`);
  } catch (error) {
    if (error.code !== "auth/user-not-found") throw error;

    const password = process.env.CAREPOINT_ADMIN_PASSWORD;
    if (!password || password.length < 6) {
      throw new Error(
        "Set CAREPOINT_ADMIN_PASSWORD to a password of at least 6 characters to create the Firebase Authentication account."
      );
    }

    user = await auth.createUser({ email, password, displayName: name });
    console.info(`Created Firebase Authentication account for ${email}.`);
  }

  const profileRef = db.collection("users").doc(user.uid);
  const existingProfile = await profileRef.get();
  const existingData = existingProfile.data() || {};

  await profileRef.set({
    id: user.uid,
    name: existingData.name || user.displayName || name,
    email,
    role: "admin",
    specialty: "",
    createdAt: existingData.createdAt || new Date().toISOString(),
  }, { merge: true });

  console.info(`Administrator profile is ready for ${email} in project ${projectId}.`);
}

main().catch(error => {
  console.error("Could not bootstrap CarePoint administrator:", error.message);
  process.exitCode = 1;
}).finally(async () => {
  await admin.app().delete().catch(() => {});
});
