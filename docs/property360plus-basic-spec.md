# Property360Plus Data Entry Spec

This document is a structured product spec based on screenshots from the
official Property360Plus website and the notes in
[`tests/implementation.md`](../tests/implementation.md).

The goal is to define the smallest useful set of data-entry views, fields, and
autofill rules so we can implement the basics later without guessing at the
data model.

This spec intentionally excludes calculation-heavy components for now. We will
come back to rent processing maths, ledger logic, and reconciliation once more
screenshots are collected and the live site is tested against them.

## Scope

This spec covers the core data-entry areas visible in the screenshots:

- Owners
- Properties
- Leases
- Process Rent
- Payments and expenses
- Invoices

It also records the shared list-view behaviour seen across the site:

- Search
- Sort
- Pagination
- Export
- Inactive/archive handling
- Copy, print, and PDF output

## Design Rules

1. Treat screenshot labels as product references, not source-of-truth schema.
2. Store user-entered fields separately from derived or greyed-out fields.
3. Greyed-out fields should generally be treated as readonly autofill.
4. If a field is copied from another entity, track the source entity and source id.
5. `Inactive` should behave like archive, not delete.

## Shared List-View Pattern

These list views all follow the same basic interaction pattern:

- Active records are shown by default.
- A dropdown controls how many entries are displayed.
- Search should work best on name or reference fields.
- Columns can be sorted alphabetically or in reverse.
- Copy, print, and PDF export are available.
- Actions usually include edit and inactive/archive.

## Entity: Owners

### Purpose

Owner records store the person or business receiving the property income and
statement details.

### List View

Visible columns:

- Ref.
- Title
- First Name
- Surname
- Email
- Mobile Number
- Postal Address
- Actions

### Add / Edit Fields

Required or primary inputs:

- Owner reference
- Title
- First name
- Surname

Optional contact fields:

- Email 1 to Email 4
- Mobile phone

Postal address fields:

- Country
- Unit number
- Street number
- Street name or PO box
- Suburb
- State
- Postcode

Bank details:

- Bank
- Account name
- BSB
- Account number
- Payment reference

Notes and attachments:

- Notes about owner
- Google Drive folder or Dropbox folder link

### Behaviour Notes

- If title is a company, trust, or business, `-` is acceptable.
- `Owner reference` may be optional.
- The owner list supports search, sort, copy, print, PDF, and inactive/archive.

## Entity: Properties

### Purpose

Property records define the rental asset, its owner, and the management
settings that flow into leases.

### List View

Visible columns:

- Property Ref.
- Type
- Address
- Rent
- Commission (%)
- Owner
- Contract
- Actions

### Add / Edit Fields

Required or primary inputs:

- Property reference
- Owner
- Property type
- Street number
- Street name
- Suburb
- Postcode
- State
- Country

Optional address fields:

- Room number
- Unit number

Rental and fee fields:

- Furnished
- Owner suggested rental price
- Management commission percent, excluding GST
- Monthly administration fee, excluding GST
- Monthly backyard maintenance fee, excluding GST
- Advertisement and promotion fee, excluding GST
- Agreed spend limit

Attachment and notes:

- Contract / Form 6
- Notes about the property
- WiFi SSID
- WiFi password

### Behaviour Notes

- Most properties default to weekly rent.
- Warehouses, shops, and some Victoria properties may use monthly payment
  handling.
- Show a warning when the property type changes the rent cycle.
- The management commission is a configured percentage, not a derived value.

## Entity: Leases

### Purpose

Lease records connect a property to one or more tenants and define the rent,
bond, and lease dates.

### List View

Visible columns:

- Property Ref.
- Tenant(s)
- Lease Start
- Lease End
- Rent Price
- Lease Expiry
- Tenant Credit
- Actions

### Add / Edit Fields

Primary inputs:

- Property
- Lease term
- Lease start date
- Rental price per week or month
- Existing tenant credit

Derived or defaulted fields:

- Lease end date
- Bond amount
- Lease expiry
- Rent frequency label

Tenant group:

- Up to 5 tenants
- First name
- Surname
- Email
- Mobile
- Date of birth
- Notes

Additional lease fields:

- Number of tenants
- Notes / special conditions
- Pets allowed
- Pet amount
- Pet notes
- Actual move out date
- New lease letting fee

### Behaviour Notes

- Lease term is presented in 6 month intervals.
- Lease start and lease end are linked; lease end should usually be calculated
  from the selected term.
- Bond amount should autofill to the default rule unless manually overridden.
- The default new lease letting fee options are:
  - 100% of one week rent
  - 50% of one week rent
  - 0% and process manually

### Autofill Rules

- Property selection should populate rent cycle and suggested rent where present.
- Tenant names should appear in the lease list and process-rent screens.
- Tenant credit should flow from prior ledger activity.
- Lease expiry should mirror lease end unless the product later adds a separate
  expiry rule.

### Historic Lease Behaviour

The historic lease view should preserve prior rent history rather than rewrite
it in place.

Recommended rules:

- Historic lease rent is readonly.
- Historic start and end dates may be viewable, but rent should not be edited
  in-place on a closed period.
- If rent changes, create a new effective-dated lease revision or new lease
  period instead of altering the historical record.
- Use the historic lease screen for audit, preview, and reference work only.

This aligns with the Queensland rent history requirements: rent can only be
increased once at least 12 months have passed since the current rent became
payable, the date of the last increase must be recorded in the agreement, and
property managers must keep accurate rent records.

### Update Lease Behaviour

The normal edit/update lease action should be for the active lease record and
should not silently change historical rent figures.

Recommended rules:

- Update lease may change metadata such as tenant details, dates, notes, and
  other non-historic fields.
- Update lease should not overwrite past rent history.
- Rent changes should be entered as a new revision with an effective date and
  supporting note or reason.
- If the current active lease is being renewed, the new lease record should
  carry forward only the data that is meant to survive into the next period.

This mirrors the RTA position that a rent increase needs to satisfy timing and
notice rules, including the 12-month rule and the required written notice for
new or fixed-term arrangements.

## Entity: Process Rent

### Purpose

The rent-processing screen records a payment event and updates the lease ledger.

### View Type

There is no list view first. It is a form-driven workflow.

### Add / Process Fields

Required inputs:

- Lease
- Rent received on
- Payment type
- Amount received

Optional inputs:

- Change go to balance
- Comment
- Email receipt to tenant
- Email myself a copy
- Letting fee received

### Autofill / Greyed-Out Fields

These should populate from the selected lease:

- Tenant name
- Rent price weekly
- Rent per day
- Total rent paid so far
- Total rent after processing this rent
- Was paid to date
- New paid to date
- Lease end
- Total to complete lease
- Opening balance
- Closing balance
- Change

### Behaviour Notes

- Payment types seen in the notes are EFT, cash, cheque, and credit card.
- The selected amount received must validate before the form can be processed.
- If `change go to balance` is checked, change should be rolled into tenant
  credit instead of returned.
- Process rent should update the lease ledger and the tenant credit.
- The exact calculation rules for the greyed-out values will be defined later
  after more screenshots and live-site validation.

## Entity: Payments and Expenses

### Purpose

These appear to be subcategories used for tracking cash movement and future
reconciliation work.

### Subcategories

- Payments
- Deposits
- Expenses
- Withhelds

### Behaviour Notes

- The exact storage model should keep these as transaction categories rather than
  hard-coded columns where possible.
- Each transaction should be traceable back to the screen or workflow that
  created it.
- Balance should behave like a running ledger bucket:
  - deposits increase balance
  - payments decrease balance
  - expenses decrease balance
  - withheld amounts decrease balance
- The balance should be stored or derived per relevant ledger context, most
  likely per lease or property, rather than treated as a free-floating value.

## Entity: Invoices

### Purpose

The invoices area is a separate workflow from payments and expenses. It tracks
issued, paid, reversed, and void invoices.

### List Views

The screenshots show separate tabs or sections for:

- Unpaid invoices
- Paid invoices
- Reversed invoices
- Void invoices

### List View Columns

Visible columns across the invoice tables include:

- Issue To
- Audit No.
- Category
- Description
- Invoice Date
- Due Date
- Payment Date
- Reversal Date
- Void Date
- Amount
- Actions

### Add / Edit Fields

Likely invoice inputs:

- Issue to
- Audit number
- Category
- Description
- Invoice date
- Due date
- Amount

Status-related fields:

- Payment date
- Reversal date
- Void date

### Behaviour Notes

- The invoice system should preserve history across the four tabs instead of
  collapsing every state into a single table.
- Invoice categories should be flexible enough to cover water, fees, repairs,
  and other recurring or one-off charges.
- The action buttons differ by invoice state, so invoice state should be explicit
  in the data model.

## Autofill Rules

These are the most important cross-screen autofill relationships:

- Property selection fills lease defaults.
- Lease selection fills tenant name, rent amounts, and related labels.
- Property rent settings influence lease rent defaults.
- Owner bank details influence payment targets later on.
- Invoice rows should retain the issue-to target, audit number, and current
  state when moved between unpaid, paid, reversed, and void tabs.

## Greyed-Out Fields

Fields that appear greyed out should usually be readonly and derived.

Examples:

- Tenant name on process-rent screen
- Rent per day
- Was paid to
- New paid to
- Lease end
- Closing balance

If a greyed-out field later needs override support, it should be a deliberate
workflow choice rather than a normal editable field.

## Validation Rules

Recommended minimum validation:

- Required fields must block save.
- Phone and email fields should be format checked.
- Money values should be stored in cents.
- Percentage fields should allow decimals.
- Lease end should not be before lease start.
- Tenant counts should match the number of visible tenant rows in the form.

## Database Guidance

For later implementation, the database should prefer these record types:

- Owner
- Property
- Lease
- Lease tenant
- Payment or expense category
- Rent receipt
- Ledger transaction
- Invoice

Do not store all derived values as primary source data unless they are an
explicit snapshot or audit record.

## Open Questions

- Whether edit-history is a separate workflow or part of edit lease.
- Whether inactive records are soft-deleted or archived.
- Whether monthly property types share the same schema as weekly rent types.
- Whether the process-rent form should support partial allocation to rent and
  fees in the first version.

## Next Build Step

The cleanest next implementation step is to flesh out the data models for these
sections and keep collecting screenshots before we define the calculation rules.
