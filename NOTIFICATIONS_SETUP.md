# CarePoint Firebase setup

CarePoint uses Firebase Authentication for sign-in and Cloud Firestore for
user profiles and appointments. Passwords are handled by Firebase Auth and are
not stored in Firestore.

## Firebase project setup

1. In Firebase Console, confirm Email/Password is enabled under Authentication.
2. Create a Cloud Firestore database.
3. Add `localhost` and `127.0.0.1` under Authentication > Settings > Authorized domains.
4. Deploy the rules in `firestore.rules`. With the Firebase CLI installed and
   signed in, run `firebase deploy --only firestore:rules --project hospital-45a70`
   from this folder. Alternatively, copy the rules into Firestore > Rules and
   publish them.
5. From this folder, run `npm start` and open `http://localhost:3000`.

The Firebase web config is in `carepoint_hospital_booking.html`. Firebase web
API keys identify the project; Firestore rules are what protect its data. Do
not replace the supplied rules with public read/write rules.

## Bootstrap the first administrator

Public registration intentionally creates patient accounts only. To safely
create the first administrator, use a trusted local machine with Firebase
Admin SDK credentials for the `hospital-45a70` project. Never put a service
account key or administrator password in source code or commit it to the
repository.

1. In Google Cloud Console, create/download a service account key for a
   trusted administrator account with Firebase Authentication and Firestore
   access. Store the JSON key outside this project.
2. In PowerShell, set the credential file path and run the bootstrap command:

   ```powershell
   $env:GOOGLE_APPLICATION_CREDENTIALS = "C:\secure\firebase-admin-key.json"
   $env:CAREPOINT_ADMIN_PASSWORD = "choose-a-strong-password"
   $env:CAREPOINT_ADMIN_NAME = "CarePoint Administrator"
   npm install
   npm run bootstrap:admin
   Remove-Item Env:\CAREPOINT_ADMIN_PASSWORD
   ```

   The command creates `admin@carepoint.demo` in Firebase Authentication if
   needed and sets its Firestore `users/{UID}` profile role to `admin`. If the
   Authentication account already exists, its password is not changed; reset
   it in Firebase Console if necessary. The script does not print passwords.
3. Sign in to CarePoint with `admin@carepoint.demo` and the password for that
   Firebase Authentication account. The bootstrap command can be run again
   safely to repair the admin profile.
4. Remove the service account key from the machine when finished, following
   your organization's credential-handling policy.

## Create staff accounts

1. Register an account through CarePoint. New accounts receive the patient role.
2. In Firebase Console > Authentication, copy that account's UID.
3. In Firestore, create or edit `users/{UID}` and set `role` to `admin` or
   `doctor`. Keep `id`, `name`, and `email` consistent with the account. Doctor
   profiles also need a `specialty` matching one of the app's listed specialties.
4. Sign out and sign in again. An administrator can promote other registered
   accounts from User management.

Staff roles are intentionally not selectable during public registration.
Existing local demo accounts and localStorage records are not migrated. Register
new accounts; do not copy old plaintext passwords into Firebase or Firestore.

## Run CarePoint

1. Install Node.js 20 or newer.
2. Run `npm install`.
3. Run `npm start`.
4. Open `http://localhost:3000`.

## In-app reminders

Confirmed appointments within one hour show an in-app pop-up every 30 seconds
for the signed-in patient or assigned doctor. Keep the CarePoint page open and
signed in to receive reminders. This is not email or operating-system push
notification delivery.

## Prototype limitations

- This classroom prototype is not a compliant medical-record system. Use only
  fictional data; production use requires a security, privacy, and regulatory
  review.
- Appointment availability checks run in the browser. A production deployment
  needs a trusted server-side transaction to prevent simultaneous bookings for
  the same doctor and time.
- User profiles and appointments synchronize across signed-in devices through
  Firestore. In-app reminders still require the page to remain open.
