# Implementation Notes based off Property360Plus

## Overview
Workflow of average interaction is:
### Owners
> First view once clicked:
- Basic show `x` entries with dropdown
- Type to search. Best to do surname or ref.
- Table schema with rows and columns.
- Columns (left to right): Ref., Title, First Name, Surname, Email, phone num, mobile num, post address, actions (edit entry or make inactive)
- Inactive is basically kind of an `archive` function.
- Copy, Print, PDF I/O output
- Also there is a sort by each column alphabetically or inverse

#### Adding a new entry:
- Owner ref: can optionally leave blank
- Title. If business, company, or trust select dash
- *First name. Must have
- surname
- email (up to 4)
- mobile phone (cut down from home and work)
- fax
- Postal address: country, unit num, street num, street name or po box, suburb, state, postcode
- Bank details: bank, account name, bsb, account num, payment ref

### Properties
Same active/inactive plus export, search and sort layout.  
Columns diff: property ref, type, address, rent, commission (percent), owner, contract (form 6),, actions including edit, copy and inactive

#### Add new property:
- *property ref.
- *owner (taken from available owners in OWNERS)
- *property type (list of types. Majority are weekly. warehouse, shop or Victoria is monthly payment. Contain alert)
- room num
- unit
- *street num
- *street name
- *suburb
- *postcode
- *state
- *country
- furnished (most time no)
- owner suggest rental price (essentially the actual rent price)
- management commission (percent, no gst)
- month administration fee (no gst)
- month backyard maintenance (no gst)
- ad and promotion fee (no gst)
- agreed spend limit
- wifi ssid and password (idk if needed)

### Leases
Same layout, different columns.  
Columns: property ref, tenants, lease start, lease end, rent price, lease expire, tenant credit, actions (edit, edit historic (personally i think edit historic should be part of edit lease), renew, inactive)

#### Add new lease:
- property:
- *lease term (in 6 month intervals)
- lease start, lease end (calculated with lease term)
- rental price per week/month
- owner suggest rent price (not available depending if set on property's suggest price)
- bond amount (auto fill, just multiply rental price per week by 4 on default)
- existing tenant credit

- Tenants (up to 5, with 3 hidden with button):
  - first name
  - surname
  - email
  - mobile
  - dob
  - notes

- num of tenants
- notes special condition
- pets yes/no
- pet amount if yes
- pet notes
- actual move out date
- new lease letting fee (100% of week rent, 50% or 0%/process manually)

### Process Rent
No initial view, purely a form.  
- *lease (select to auto fill in: tenant name, rent price weekly, rent per day, total rent paid, total rent after processing this rent, was paid to date, new paid to date, lease end, total to complete lease)
- *rent receive date
- payment type (eft, cash, cheque, credit card)
- open balance
- amount received (plus option to make change to go to balance)
- change
- closing balance
- comment (options to email to receipt to tenant or myself a copy)
- letting fee received
### Payments & Expenses (Subcategories:)
   Payments
   Deposits
   Expenses
   Withhelds

Balance appears to behave like a running ledger bucket for the selected lease
or property:
- deposits add to balance
- payments reduce balance
- expenses reduce balance
- withhelds reduce balance

### Invoices
Separate tab below Payments & Expenses.
- Unpaid Invoices
- Paid Invoices
- Reversed Invoices
- Void Invoices

Visible columns across invoice tables:
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
