# Client Forms

Reference list of client-facing forms, backing the "Client Form" button on
the client profile page (`ClientsView.tsx`). Each URL should be the stable,
version-controlled link — since the underlying document gets updated in
place, the URL here should never need to change even when the form content
does.

Once this stabilizes, it moves into the Google Sheet (see HANDOFF.md's
Google Sheets/Apps Script plan) — this file is the starting point.

One line per form:

```
- Form Name — https://full-url-to-the-form
```

## Forms

- Graduation Certificate — https://docs.google.com/document/d/15Fj2WdEKf3MKxAKIcFgo8X6S7I9qNJ3tPi4ov3d1oeI/edit?usp=drivesdk

## Auto-Fill Forms (reused from stc_dashboard_v4)

Four forms already exist as working Apps Script code in `stc_dashboard_v4`
(the other GAS dashboard). Unlike the static links above, these generate a
**new document per client, per use** — not one stable URL — so they don't
fit the simple `Name — URL` list. They need the deferred Google Sheets/Apps
Script backend (see HANDOFF.md) before this React app can trigger them; this
section is the spec to build against when that lands, not live yet.

### Discharge Form

- Mechanism: copies a Google Doc template, replaces `{{tag}}` placeholders, returns the new copy's URL.
- Source: `fillDischargeForm()` in `stc_dashboard_v4/Code.js`.
- Template doc ID: `1-Hxn_jeJd2w2ONhQKeUrQFQRtQx9HqrE584RXdlsmXo`
- Tags: `client_name`, `client_phone`, `client_email`, `client_address`, `dc_date`, `wsa`, `asa`, `adc` (wsa/asa/adc are checkbox booleans → ✓ or blank)
- Client contact info (phone/email/address/therapist) is looked up by name from a contact sheet — `getClientContactInfo_()`.

### Exit Interview

- Mechanism: same copy-and-replace pattern.
- Source: `fillExitInterview()` in `stc_dashboard_v4/Code.js`.
- Template doc ID: `1bSDCk_8UyxHIz4FwAtlEXt9wVTlnLoUEEgE5TBKqfl0`
- Tags: `client_name`, `client_location`, `clients_therapist`

### Virtual Attendance Request

- Mechanism: same copy-and-replace pattern.
- Source: `fillVirtualAttendanceRequest()` in `stc_dashboard_v4/Code.js`.
- Template doc ID: `1il-jPk6bZpzkpmqKS5W5qEkubQGPFBITV_chO0kuxH4`
- Tags: `client_name`, `client_phone`, `client_email`, `client_address`, `client_location`, `clients_therapist`, `date_of_request`, `date_of_return`, `virt_att_dates`, `virtual_location`, `reason`

### Daily Check-in

- Mechanism: **not** a doc-merge — pulls that client's Google Meet links for
  the requested dates off the admin calendar (matched by program's group
  times) and builds/sends an HTML email (to admin/intake, cc'd to the
  client), optionally scheduling later dates as separate sends. Meaningfully
  more involved than the three above (Calendar API + scheduling, no
  generated document/URL at all).
- Source: `previewDailyCheckinEmail()` / `sendDailyCheckinEmail()` in
  `stc_dashboard_v4/Code.js`, calendar lookups via `getConferenceBlocksForDate_()`.
- Inputs: `clientName`, `program`, `location`, `dates[]`, `sendMode` (`daily` | `all_at_once`).

Generated copies clean up automatically after 7 days (`cleanupOldFormCopies()`,
daily trigger) in the source project — worth deciding whether this app wants
the same retention policy once it owns this.
