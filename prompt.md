You are a senior product architect, full-stack engineer, UI/UX designer, database architect, ERP/CRM/QMS specialist, and business systems engineer.

Build a COMPLETE production-ready Business Operating System (BOS) for a professional 3D printing business named:

PRINTXO

This is NOT a landing page.
This is NOT a dashboard mockup.
This is NOT a CRUD demo.

Build a complete working web application that can actually be used to operate a 3D printing business.

The system must combine:

ERP
+ CRM
+ Quotation
+ Order Management
+ Production Management
+ Inventory
+ Filament Management
+ Printer Management
+ Product Management
+ CAD/R&D Management
+ Calibration
+ Print Profiles
+ Quality Management / TQM
+ Customer Feedback
+ CAPA
+ Finance
+ Invoice Generation
+ Analytics
+ Business Intelligence
+ Task Management
+ Document Management
+ Notifications
+ Settings

The application should feel like a polished SaaS product.

==================================================
01. PRIMARY OBJECTIVE
==================================================

Build an operating system that allows a 3D printing business owner to manage the complete lifecycle:

LEAD
→ CUSTOMER
→ REQUIREMENT
→ QUOTE
→ APPROVAL
→ ORDER
→ PAYMENT
→ PRODUCT
→ PRODUCTION
→ PRINT JOB
→ FILAMENT
→ PRINTER
→ QC
→ PACKAGING
→ SHIPPING
→ INVOICE
→ DELIVERY
→ CUSTOMER FEEDBACK
→ COMPLAINT
→ ROOT CAUSE
→ CAPA
→ R&D
→ PROCESS IMPROVEMENT
→ STANDARDIZATION

Every important entity must be connected.

The application must provide complete traceability.

==================================================
02. PRODUCT DESIGN PHILOSOPHY
==================================================

The application should follow these principles:

• Simple
• Fast
• Professional
• Clean
• Modern
• Data-driven
• Highly usable
• Scalable
• Mobile responsive
• Desktop optimized
• Minimal unnecessary decoration
• Strong visual hierarchy
• Excellent information architecture

Do NOT make it look like a generic AI-generated admin dashboard.

Avoid:

• excessive gradients
• excessive glassmorphism
• oversized cards
• unnecessary animations
• huge empty spaces
• decorative charts
• excessive colors
• confusing navigation
• giant dashboard widgets

The design should feel like a serious modern manufacturing SaaS.

Use a restrained visual system.

Primary brand direction:

BLACK
WHITE
RED

Use red primarily for brand accents, actions, alerts and highlights.

Use neutral backgrounds for most application surfaces.

==================================================
03. UI SYSTEM
==================================================

Create a consistent design system.

Components:

• Sidebar
• Top navigation
• Breadcrumbs
• Page header
• Tabs
• Cards
• Tables
• Data grids
• Dropdowns
• Multi-select
• Search
• Filters
• Date pickers
• Command palette
• Modals
• Drawers
• Forms
• Tooltips
• Status badges
• Progress indicators
• KPI cards
• Charts
• Activity timeline
• Empty states
• Loading states
• Error states
• Confirmation dialogs
• Toast notifications

Tables should support:

• sorting
• filtering
• search
• column visibility
• pagination
• bulk selection
• bulk actions
• export
• saved views

Forms should support:

• validation
• required fields
• autocomplete
• dropdowns
• multi-select
• file uploads
• date/time
• numeric inputs
• conditional fields

==================================================
04. APPLICATION LAYOUT
==================================================

Create:

LEFT SIDEBAR

Dashboard
Command Center
CRM
Sales
Orders
Products
Production
Printers
Filament
Inventory
Quality
R&D
Calibration
Print Profiles
Shipping
Finance
Documents
Tasks
Analytics
Reports
Settings

Top bar:

• Global Search
• Command Palette
• Notifications
• Quick Add
• Help
• User Profile

Sidebar should be collapsible.

Remember the user's last sidebar state.

==================================================
05. GLOBAL SEARCH
==================================================

Implement global search across:

Customers
Leads
Quotes
Orders
Products
Print Jobs
Printers
Filament Spools
Invoices
Payments
R&D
Calibration
Print Profiles
Complaints
CAPA

Search using:

ID
Name
SKU
Email
Phone
Tracking Number
Invoice Number
Quote Number
Order Number

Search results should show entity type and relevant metadata.

Clicking a result should navigate directly to that record.

==================================================
06. DASHBOARD
==================================================

Create a professional Executive Dashboard.

Do not overload it.

Sections:

BUSINESS OVERVIEW

• Revenue
• Gross Profit
• Net Profit
• Orders
• Customers
• Average Order Value
• Gross Margin

CUSTOMER

• New Customers
• Returning Customers
• Customer Rating
• Complaint Rate
• Return Rate

PRODUCTION

• Active Print Jobs
• Completed Jobs
• Failed Jobs
• Reprint Rate
• Print Hours
• Printer Utilization

QUALITY

• First Pass Yield
• Defect Rate
• Rework Rate
• Customer Complaints
• Open CAPA

INVENTORY

• Filament Inventory Value
• Low Stock
• Critical Stock
• Monthly Consumption

OPERATIONS

• Orders Due Today
• QC Pending
• Shipments Pending
• Payments Pending
• Maintenance Due
• Calibration Due

Charts:

Revenue Trend
Profit Trend
Orders Trend
Top Products
Printer Utilization
Failure Trend
Material Consumption

Allow date range:

Today
7 Days
30 Days
90 Days
This Year
Custom

==================================================
07. COMMAND CENTER
==================================================

Create a highly practical daily operations page.

This should be the main page used during business operations.

Show:

TODAY'S PRIORITIES

• Overdue Orders
• Orders Due Today
• Printing Now
• Queued Print Jobs
• QC Pending
• Shipping Pending
• Payment Pending
• Calibration Due
• Maintenance Due
• Low Filament
• Customer Follow-ups
• CAPA Due

Each item should be clickable.

Add:

Quick Add Customer
Quick Add Quote
Quick Add Order
Quick Add Print Job
Quick Add Expense
Quick Add R&D Experiment

==================================================
08. CRM
==================================================

Create complete CRM functionality.

LEADS

Fields:

Lead ID
Name
Company
Phone
Email
Source
Requirement
Budget
Product Interest
Status
Priority
Owner
Created Date
Last Contact
Next Follow-up
Notes

Pipeline:

New
Contacted
Qualified
Quoted
Negotiation
Won
Lost

Create pipeline view.

CUSTOMERS

Fields:

Customer ID
Name
Company
Customer Type
Phone
Email
Address
GSTIN
Source
First Order
Last Order
Total Orders
Revenue
Average Order Value
Rating
Complaints
Returns
Outstanding Balance
Status
Notes

Automatically calculate customer metrics.

==================================================
09. QUOTATION SYSTEM
==================================================

Build a complete quotation generator.

Quote creation workflow:

Customer
→ Product / Custom Requirement
→ Quantity
→ Material
→ Print Time
→ Filament
→ Post Processing
→ Packaging
→ Shipping
→ Other Costs
→ Margin
→ Discount
→ Tax
→ Final Price

Quotation fields:

Quote ID
Quote Number
Customer
Date
Valid Until
Prepared By
Currency
Payment Terms
Delivery Estimate
Notes

Line items:

Product
Description
Quantity
Unit Price
Discount
Tax
Line Total

Additional costs:

Design Cost
CAD Modification
Material Cost
Print Cost
Post Processing
Packaging
Shipping
Other

Automatically calculate:

Subtotal
Discount
Tax
Grand Total
Estimated Cost
Estimated Profit
Margin

Allow:

Save Draft
Generate PDF
Preview
Download
Send
Duplicate
Convert to Order
Archive

Quote statuses:

Draft
Sent
Viewed
Negotiation
Accepted
Rejected
Expired
Converted

==================================================
10. PRICING ENGINE
==================================================

Create a configurable pricing engine.

Calculate product pricing using:

Material Cost
+
Machine Cost
+
Electricity
+
Labor
+
Post Processing
+
Packaging
+
Shipping
+
Design Cost
+
Platform/Payment Fees
+
Overhead
+
Profit Margin

Allow configurable pricing rules.

Support:

Per gram
Per hour
Fixed price
Quantity pricing
Custom quote

Calculate:

Cost per gram
Cost per machine hour
Labor rate
Markup
Margin

Do NOT hard-code business pricing.

All rates should be configurable in Settings.

==================================================
11. ORDER MANAGEMENT
==================================================

Create complete order management.

Order fields:

Order ID
Order Number
Customer
Quote
Order Date
Due Date
Priority
Items
Subtotal
Discount
Tax
Shipping
Total
Payment Status
Production Status
QC Status
Shipping Status
Overall Status

Order lifecycle:

Quote Accepted
→ Order Confirmed
→ Payment
→ Production
→ QC
→ Packaging
→ Shipping
→ Delivered
→ Completed

Order detail page should show:

Customer
Items
Timeline
Payments
Print Jobs
QC
Shipment
Invoice
Notes
Documents

==================================================
12. PRODUCT MANAGEMENT
==================================================

Create a professional Product Master.

Fields:

Product ID
SKU
Product Name
Category
Type
Description
Status
Version
Revision

Files:

STL
3MF
STEP
CAD
Drawing
Images
Documentation

Manufacturing:

Material
Printer
Nozzle
Print Profile
Calibration
Layer Height
Infill
Walls
Support
Standard Print Time
Standard Filament Usage

Commercial:

Selling Price
Production Cost
Profit
Margin

Quality:

Failure Rate
Reprint Rate
Return Rate
Customer Rating
Internal Quality Rating

Product versions must be tracked.

Example:

PROD-001
Version 1.0
Version 1.1
Version 2.0

Never overwrite historical versions without maintaining revision history.

==================================================
13. CUSTOM PRODUCT / JOB SYSTEM
==================================================

Support custom 3D printing orders.

Customer can require:

• custom dimensions
• custom design
• logo
• engraving
• material
• color
• tolerance
• strength
• quantity
• surface finish

Create a custom requirement record.

Track:

Requirement
CAD
Revision
Approval
Quote
Production
QC

Allow customer-approved design files.

==================================================
14. PRODUCTION MANAGEMENT
==================================================

Create a production planning system.

Production dashboard:

Queued
Scheduled
Printing
QC
Completed
Failed
Reprint

Create Print Jobs.

Fields:

Print Job ID
Order ID
Product ID
Printer ID
Spool ID
Print Profile ID
Calibration ID
Operator
Quantity
Estimated Time
Actual Time
Estimated Filament
Actual Filament
Waste
Start
End
Status
Result
Failure Reason
QC Status
Notes

==================================================
15. PRINT FARM / PRINTER MANAGEMENT
==================================================

Create Printer Master.

Fields:

Printer ID
Name
Manufacturer
Model
Serial Number
Purchase Date
Purchase Cost
Location
Nozzle
Status

Metrics:

Total Print Hours
Total Jobs
Successful Jobs
Failed Jobs
Failure Rate
Utilization
Downtime
Maintenance Cost
Revenue
Profit
ROI

Printer status:

Available
Printing
Maintenance
Offline
Calibration
Error

Create printer detail page with:

Current Job
Queue
History
Maintenance
Calibration
Utilization
Failure Rate

==================================================
16. FILAMENT MANAGEMENT
==================================================

Manage filament at individual spool level.

Fields:

Spool ID
Brand
Material
Series
Color
Diameter
Initial Weight
Current Weight
Used Weight
Waste
Remaining %
Cost
Cost/g
Supplier
Purchase Date
Batch
Lot
Storage Location
Drying Status
Last Drying
Status
Reorder Level

Statuses:

In Stock
Opened
In Use
Low
Empty
Defective
Archived

Support spool traceability.

Every Print Job should reference a Spool ID.

==================================================
17. INVENTORY
==================================================

Inventory should include:

Filament
Nozzles
Build Plates
Consumables
Packaging
Spare Parts
Other Materials

Track:

SKU
Item
Category
Quantity
Unit
Unit Cost
Inventory Value
Reorder Level
Supplier
Location
Status

Alerts:

Low Stock
Critical Stock
Out of Stock

==================================================
18. CALIBRATION MANAGEMENT
==================================================

Create engineering-grade calibration management.

Calibration types:

First Layer
Flow
Temperature
Retraction
Pressure Advance
Dimensional Accuracy
Overhang
Bridging
Cooling
Speed
Bed Adhesion

Fields:

Calibration ID
Printer
Material
Brand
Nozzle
Parameter
Previous Value
Test Value
Measured Value
Recommended Value
Tolerance
Result
Operator
Date
Approval
Next Calibration

Lifecycle:

Draft
Testing
Approved
Active
Retired

Only approved calibration settings should be recommended for production.

==================================================
19. PRINT PROFILE MANAGEMENT
==================================================

Create Print Profile Master.

Fields:

Profile ID
Profile Name
Printer
Material
Nozzle
Layer Height
Walls
Top Layers
Bottom Layers
Infill
Speed
Temperature
Cooling
Retraction
Support
Slicer
Slicer Version
Calibration ID
Version
Status
Approval
Test Date

Lifecycle:

Draft
Testing
Approved
Production
Retired

Track:

Success Rate
Failure Rate
Average Print Time
Average Filament Usage
Surface Quality
Dimensional Accuracy

==================================================
20. QUALITY MANAGEMENT / TQM
==================================================

Implement a proper quality management system.

Quality principles:

Customer Focus
Prevention
Process Control
Standardization
Traceability
Data-driven decisions
Continuous Improvement

Quality record:

QC ID
Order ID
Product ID
Print Job ID
Inspector
Inspection Date
Inspection Stage
Specification
Required Value
Actual Value
Tolerance
Result
Defect
Severity
Rework
Reprint
Root Cause
Corrective Action
Preventive Action

Stages:

Incoming
In Process
Final
Customer

==================================================
21. DEFECT MANAGEMENT
==================================================

Track defects such as:

Layer Shift
Warping
Stringing
Under Extrusion
Over Extrusion
Poor Adhesion
Dimensional Error
Surface Defect
Support Failure
Cracking
Weak Part
Color Issue
Wrong Material
Wrong Dimensions
Packaging Damage

Allow custom defect types.

Track:

Frequency
Cost
Printer
Product
Material
Profile
Root Cause

Create Pareto analytics.

==================================================
22. CUSTOMER COMPLAINTS
==================================================

Create complaint management.

Complaint ID
Customer
Order
Product
Date
Issue
Severity
Description
Evidence
Status
Owner
Resolution
Resolution Date

Statuses:

Open
Investigating
Action Required
Resolved
Closed

==================================================
23. CAPA
==================================================

Create Corrective and Preventive Action management.

CAPA ID
Complaint
Quality Issue
Problem
Containment
Root Cause
5 Why
Fishbone Category
Corrective Action
Preventive Action
Owner
Due Date
Verification
Effectiveness Check
Status
Closure Date

CAPA workflow:

Problem
→ Containment
→ Root Cause
→ Corrective Action
→ Preventive Action
→ Verification
→ Closure

==================================================
24. R&D / ENGINEERING
==================================================

Create a complete R&D workspace.

R&D records:

Experiment ID
Project
Objective
Problem
Hypothesis
Product
Printer
Material
Spool
Print Profile
Calibration
Variables
Control
Test
Measurements
Result
Failure
Cost
Conclusion
Recommended Setting
Status

R&D lifecycle:

Idea
Planning
Experiment
Testing
Analysis
Validated
Implemented
Rejected

When an experiment produces an improved validated process:

R&D
→ New Calibration
or
R&D
→ New Print Profile
or
R&D
→ Product Revision

Maintain revision history.

==================================================
25. DESIGN / CAD LIBRARY
==================================================

Create a design library.

Track:

Design ID
Product
Version
Revision
Designer
CAD File
STEP
STL
3MF
Drawing
Material
Dimensions
Tolerance
Status
Approval
Created
Updated

Statuses:

Draft
Review
Approved
Production
Retired

Support file upload and links.

==================================================
26. SHIPPING
==================================================

Shipment management:

Shipment ID
Order
Customer
Courier
Tracking Number
Ship Date
Expected Date
Delivered Date
Shipping Cost
Status
Delay
Issue

Statuses:

Pending
Packed
Shipped
In Transit
Delivered
Delayed
Returned

==================================================
27. INVOICING
==================================================

Build a professional invoice generator.

Invoice fields:

Invoice ID
Invoice Number
Customer
Billing Address
Shipping Address
GSTIN
Invoice Date
Due Date
Payment Terms

Line items:

Product
Description
Quantity
Rate
Discount
Tax
Amount

Totals:

Subtotal
Discount
Taxable Amount
CGST
SGST
IGST
Other Tax
Shipping
Grand Total
Amount Paid
Balance Due

Invoice statuses:

Draft
Issued
Partially Paid
Paid
Overdue
Cancelled

Support:

Preview
Generate PDF
Download
Print
Send
Duplicate

Invoice numbers must be unique.

Keep invoice history immutable after issue except through controlled cancellation/credit-note processes.

==================================================
28. PAYMENT MANAGEMENT
==================================================

Track:

Payment ID
Invoice
Customer
Date
Amount
Method
Reference
Status
Notes

Methods:

UPI
Bank Transfer
Cash
Card
Payment Gateway
Other

Calculate:

Paid
Pending
Overdue

==================================================
29. EXPENSE MANAGEMENT
==================================================

Track:

Expense ID
Date
Category
Description
Supplier
Amount
Tax
Payment Method
Reference
Recurring
Notes

Categories:

Filament
Machine
Electricity
Maintenance
Packaging
Shipping
Marketing
Software
Labor
Rent
Other

==================================================
30. SUPPLIER MANAGEMENT
==================================================

Supplier Master:

Supplier ID
Name
Contact
Email
Phone
Address
GSTIN
Category
Products
Rating
Lead Time
Payment Terms
Notes

Track supplier quality.

Metrics:

On-time delivery
Material defects
Price
Lead time
Quality rating

==================================================
31. TASK MANAGEMENT
==================================================

Create task management.

Tasks:

Task ID
Title
Description
Assignee
Priority
Status
Due Date
Related Customer
Related Order
Related Product
Related Printer
Related R&D
Related CAPA

Views:

List
Kanban
Calendar

Statuses:

Todo
In Progress
Blocked
Done

==================================================
32. DOCUMENT MANAGEMENT
==================================================

Central document system for:

Quotes
Invoices
Orders
Design Files
CAD
Drawings
QC Reports
Calibration Reports
R&D Reports
SOPs
Customer Documents

Every document should be linked to its parent entity.

==================================================
33. SOP / KNOWLEDGE BASE
==================================================

Create a knowledge base.

Categories:

Printing
Calibration
Quality
Maintenance
Packaging
Customer Service
Sales
R&D
Safety
Operations

SOP structure:

Title
Purpose
Scope
Procedure
Required Tools
Parameters
Quality Criteria
Revision
Owner
Approval
Last Updated

==================================================
34. ANALYTICS ENGINE
==================================================

Create dedicated analytics pages.

SALES ANALYTICS

Revenue
Orders
Average Order Value
Conversion Rate
Quote Acceptance
Revenue by Product
Revenue by Customer
Revenue by Category

PRODUCTION ANALYTICS

Print Hours
Jobs
Success Rate
Failure Rate
Reprint Rate
Waste
Printer Utilization
Production Cost

PRODUCT ANALYTICS

Units Sold
Revenue
Profit
Margin
Failure Rate
Return Rate
Rating

PRINTER ANALYTICS

Utilization
Print Hours
Jobs
Failure Rate
Downtime
Maintenance Cost
ROI

FILAMENT ANALYTICS

Consumption
Waste
Cost
Cost/g
Material usage
Consumption by product

CUSTOMER ANALYTICS

New Customers
Returning Customers
Revenue
Average Order Value
Retention
Rating
Complaints

QUALITY ANALYTICS

First Pass Yield
Defect Rate
Reprint Rate
Complaint Rate
Return Rate
Pareto of Defects
Quality Cost

FINANCE ANALYTICS

Revenue
COGS
Gross Profit
Operating Expenses
Net Profit
Cash Flow
Margin

R&D ANALYTICS

Experiments
Success Rate
Improvements
Failure Reduction
Waste Reduction
Cost Savings

==================================================
35. CHARTS
==================================================

Use charts only where they improve understanding.

Use:

Line charts
Bar charts
Stacked bar
Donut charts
Area charts
Pareto charts
Funnel charts

Do not use charts simply because space is available.

Every chart must answer a business question.

==================================================
36. REPORT GENERATOR
==================================================

Create reporting system.

Reports:

Daily Operations
Weekly Business
Monthly Business
Sales
Production
Quality
Inventory
Finance
Customer
R&D

Allow:

Date range
Filters
Export
PDF
Print

==================================================
37. BUSINESS KPIs
==================================================

Calculate:

Revenue
Gross Profit
Net Profit
Gross Margin
Average Order Value
Customer Acquisition Cost
Customer Lifetime Value
Repeat Customer Rate
Quote Conversion
On-Time Delivery
First Pass Yield
Defect Rate
Reprint Rate
Waste %
Printer Utilization
Cost per Print Hour
Cost per Gram
Cost of Poor Quality

Do not invent data.

Display "No Data" when insufficient data exists.

==================================================
38. COST OF QUALITY
==================================================

Track:

PREVENTION

Calibration
Training
Testing
Quality Planning

APPRAISAL

Inspection
Testing
QC

INTERNAL FAILURE

Failed Prints
Reprints
Rework
Waste
Downtime

EXTERNAL FAILURE

Returns
Refunds
Replacements
Complaints
Shipping Loss

Calculate total Cost of Quality.

==================================================
39. NOTION-LIKE DATABASE EXPERIENCE
==================================================

Implement Notion-like behavior where technically practical.

Support:

Relations
Rollups
Select
Multi-select
Status
Checkbox
Formula
Files
Links
Comments
Activity history

Example:

Customer
→ Orders
→ Quotes
→ Payments
→ Complaints

Product
→ Print Profiles
→ Calibration
→ Print Jobs
→ QC
→ Orders
→ Revenue

Printer
→ Print Jobs
→ Calibration
→ Maintenance
→ Utilization

Spool
→ Print Jobs
→ Material Consumption
→ Waste

R&D
→ Product
→ Printer
→ Material
→ Calibration
→ Print Profile

==================================================
40. ACTIVITY TIMELINE
==================================================

Every major entity should have an activity timeline.

Example Order:

Quote created
→ Quote sent
→ Quote accepted
→ Payment received
→ Production started
→ Print completed
→ QC passed
→ Shipped
→ Delivered
→ Invoice paid

==================================================
41. AUDIT LOG
==================================================

Track important changes.

Record:

User
Action
Entity
Entity ID
Old Value
New Value
Timestamp

Especially for:

Prices
Quotes
Orders
Invoices
Products
Calibration
Print Profiles
Quality records

==================================================
42. NOTIFICATIONS
==================================================

Create notification center.

Notify for:

Overdue Order
Payment Due
Low Stock
Critical Stock
Calibration Due
Maintenance Due
QC Failure
CAPA Due
Quote Expiring
Invoice Overdue
Shipping Delay
Customer Follow-up

==================================================
43. SETTINGS
==================================================

Create centralized settings.

Business:

Company Name
Logo
Address
Phone
Email
GSTIN
Website
Currency

Pricing:

Machine Rate
Electricity Rate
Labor Rate
Overhead %
Default Margin
Tax Rates

Operations:

Order statuses
Production statuses
Quality statuses
Shipping statuses

Master Data:

Materials
Printers
Categories
Defect Types
Suppliers
Payment Methods
Units

==================================================
44. AUTHENTICATION
==================================================

Implement secure authentication.

Roles:

Owner
Admin
Manager
Production
Designer
Quality
Sales
Finance
Viewer

Role-based permissions.

Example:

Finance:
Invoices
Payments
Expenses

Production:
Print Jobs
Printers
Filament

Quality:
QC
CAPA
Complaints

Designer:
Products
CAD
R&D

Owner:
Everything

==================================================
45. DATABASE ARCHITECTURE
==================================================

Use a properly normalized relational database.

Core entities:

users
roles
customers
leads
quotes
quote_items
orders
order_items
products
product_versions
design_files
printers
printer_maintenance
filament_spools
materials
print_profiles
calibrations
print_jobs
quality_inspections
defects
complaints
capa
rnd_projects
rnd_experiments
shipments
invoices
invoice_items
payments
expenses
suppliers
inventory
tasks
documents
sops
notifications
audit_logs

Use proper:

Primary keys
Foreign keys
Indexes
Unique constraints
Timestamps
Created_by
Updated_by

Do not duplicate master data unnecessarily.

==================================================
46. DATA RELATIONSHIPS
==================================================

Implement strong relationships.

Example:

Customer
has many Leads
has many Quotes
has many Orders
has many Payments
has many Complaints

Product
has many Versions
has many Print Profiles
has many Print Jobs
has many QC Records
has many Orders

Printer
has many Print Jobs
has many Calibrations
has many Maintenance Records

Filament Spool
has many Print Jobs

Print Job
belongs to Order
belongs to Product
belongs to Printer
belongs to Spool
belongs to Print Profile
belongs to Calibration

==================================================
47. TRACEABILITY
==================================================

A customer complaint must allow tracing:

Customer
→ Order
→ Product
→ Print Job
→ Printer
→ Print Profile
→ Calibration
→ Filament Spool
→ Batch/Lot
→ Operator
→ QC

This is a critical requirement.

==================================================
48. DATA VALIDATION
==================================================

Prevent invalid data.

Examples:

Invoice cannot be marked Paid if no payment exists.

Print Job cannot use a Retired Print Profile.

Production should warn if calibration is outdated.

Shipment cannot be marked Delivered without shipment information.

Quote cannot be converted twice.

Invoice number must be unique.

Spool weight cannot become negative.

Actual filament cannot exceed available spool weight.

Due dates should not be earlier than order dates unless explicitly overridden.

==================================================
49. CALCULATIONS
==================================================

Use centralized calculation logic.

Examples:

Profit =
Revenue - Total Cost

Margin =
Profit / Revenue

Failure Rate =
Failed Jobs / Total Jobs

First Pass Yield =
Jobs Passing QC First Time / Total Jobs

Waste % =
Waste Weight / Total Material Used

Printer Utilization =
Actual Print Hours / Available Hours

Customer Repeat Rate =
Returning Customers / Total Customers

Do not duplicate calculation logic throughout the application.

==================================================
50. DOCUMENT GENERATION
==================================================

Create professional document templates.

QUOTE PDF

PRINTXO
Quote Number
Date
Valid Until
Customer
Items
Pricing
Tax
Total
Terms
Notes
Company Details

INVOICE PDF

PRINTXO
Invoice Number
Invoice Date
Due Date
Customer
GSTIN
Items
Tax
Total
Payment Status
Bank/UPI Details
Terms

QC REPORT

Product
Order
Print Job
Inspection
Measurements
Result
Inspector
Date

CALIBRATION REPORT

Printer
Material
Nozzle
Tests
Results
Approved Settings
Approval
Date

==================================================
51. FILE STORAGE
==================================================

Support secure storage for:

Product Images
STL
3MF
STEP
CAD
Drawings
Invoices
Quotes
QC Reports
R&D Documents

Do not store huge binary files directly inside database rows.

Store file metadata and secure storage references.

==================================================
52. RESPONSIVE DESIGN
==================================================

Desktop:
Full sidebar
Wide tables
Analytics

Tablet:
Collapsible sidebar
Responsive cards

Mobile:
Bottom navigation or compact navigation
Quick actions
Essential data entry
Responsive forms
Scrollable tables

The application must remain usable on mobile.

==================================================
53. PERFORMANCE
==================================================

Build for scalability.

Requirements:

• Pagination
• Server-side filtering where appropriate
• Indexed database queries
• Lazy loading
• Debounced search
• Optimized charts
• Avoid unnecessary API calls
• Avoid fetching entire datasets
• Proper caching where useful

==================================================
54. ERROR HANDLING
==================================================

Implement:

Loading states
Empty states
Error states
Retry
Validation messages
Success notifications

Never silently fail.

Use human-readable error messages.

==================================================
55. SECURITY
==================================================

Implement:

Authentication
Authorization
Row-level permissions where appropriate
Input validation
Secure file access
Protected API routes
Environment variables
No exposed secret keys
Audit logging

Never expose private credentials in frontend code.

==================================================
56. SEED DATA
==================================================

Create realistic DEMO data so the application can be tested.

Do NOT use thousands of fake records.

Use enough data to demonstrate:

Customers
Products
Orders
Quotes
Printers
Spools
Print Jobs
QC
Invoices
Payments
R&D
Calibration
Analytics

Clearly label demo data.

Make it easy to delete/reset demo data.

==================================================
57. QUICK ACTIONS
==================================================

Create a global "+" button.

Quick actions:

New Lead
New Customer
New Quote
New Order
New Product
New Print Job
New Spool
New QC
New Complaint
New CAPA
New R&D Experiment
New Invoice
New Payment
New Expense
New Shipment
New Task

==================================================
58. COMMAND PALETTE
==================================================

Implement keyboard-friendly command palette.

Examples:

Search Customer
Create Quote
Create Order
Create Invoice
Create Print Job
Open Dashboard
Open Product
Open Printer
Open Filament
Open Analytics

Support keyboard shortcuts where practical.

==================================================
59. BUSINESS WORKFLOWS
==================================================

Implement these end-to-end workflows.

WORKFLOW 1:

Lead
→ Customer
→ Quote
→ Accepted
→ Order

WORKFLOW 2:

Order
→ Payment
→ Production
→ Print Job
→ QC
→ Shipment
→ Invoice
→ Completed

WORKFLOW 3:

Product
→ CAD
→ Prototype
→ R&D
→ Calibration
→ Print Profile
→ QC
→ Approved
→ Production

WORKFLOW 4:

Failure
→ Defect
→ Root Cause
→ CAPA
→ R&D
→ Improved Setting
→ New Standard

WORKFLOW 5:

Filament

Purchase
→ Inventory
→ Spool
→ Calibration
→ Print
→ Consumption
→ Reorder

==================================================
60. UI QUALITY BAR
==================================================

Before considering a page complete, ask:

Can a real employee understand this page in 5 seconds?

Can they add a record quickly?

Can they find a record quickly?

Can they filter it?

Can they sort it?

Can they see related information?

Can they navigate to related records?

Can they understand status?

Can they identify problems?

Can they perform the next action?

If not, redesign the page.

==================================================
61. TABLE UX
==================================================

Tables are extremely important.

Implement:

Search
Filter
Sort
Pagination
Column resize
Column visibility
Saved views
Bulk selection
Bulk actions
Export

Useful saved views:

My Tasks
Today
Overdue
Active
Completed
Low Stock
Failed
Pending QC
Pending Payment
Production
Approved

==================================================
62. ANALYTICS UX
==================================================

Every analytics page should have:

Date filter
Period comparison
KPI cards
Charts
Breakdown
Table
Export

Example:

Product Analytics

Top Products
Revenue
Profit
Margin
Units
Failure Rate
Rating

Clicking a product should open its detailed record.

==================================================
63. MOBILE QUICK ENTRY
==================================================

Optimize quick entry for:

Print Job
QC
Filament Usage
Customer
Order
Expense
Maintenance

Minimize fields required for routine operations.

Advanced fields can be optional.

==================================================
64. APPLICATION NAVIGATION
==================================================

Use contextual navigation.

Example:

Order page:

Customer → clickable
Quote → clickable
Product → clickable
Print Job → clickable
Invoice → clickable
Payment → clickable
Shipment → clickable

Product page:

Orders → clickable
Print Jobs → clickable
Print Profiles → clickable
Calibration → clickable
R&D → clickable
QC → clickable

==================================================
65. DESIGN SYSTEM
==================================================

Create reusable components instead of designing every page independently.

Create:

AppShell
Sidebar
Topbar
PageHeader
DataTable
FilterBar
SearchBar
KPI
StatusBadge
EntityLink
EntitySelector
MultiSelect
FormField
Modal
Drawer
Timeline
ChartCard
EmptyState
ConfirmDialog
FileUploader
ActivityFeed

==================================================
66. CODE QUALITY
==================================================

Use:

TypeScript
Strong typing
Reusable components
Clean architecture
Service layer
Validation schemas
Centralized constants
Centralized calculations
Reusable database queries

Avoid:

massive components
duplicated code
hardcoded business rules
hardcoded dashboard numbers
magic strings
dead code
unused dependencies

==================================================
67. DEVELOPMENT PROCESS
==================================================

DO NOT build everything as one giant page.

Build in phases.

PHASE 1
Foundation
Authentication
Database
Design system
Application shell

PHASE 2
CRM
Customers
Leads
Quotes

PHASE 3
Orders
Products
Pricing
Invoices
Payments

PHASE 4
Production
Printers
Print Jobs
Filament
Inventory

PHASE 5
Engineering
Calibration
Print Profiles
CAD
R&D

PHASE 6
Quality
QC
Defects
Complaints
CAPA
TQM

PHASE 7
Shipping
Documents
SOPs
Tasks
Notifications

PHASE 8
Analytics
Reports
Executive Dashboard
Command Center

PHASE 9
Polish
Responsive design
Performance
Security
Testing
Error handling

==================================================
68. TESTING
==================================================

Test all major workflows.

Create:

Unit tests
Integration tests
Database constraint tests
Form validation tests
Critical workflow tests

Test:

Quote → Order
Order → Print Job
Print Job → QC
Order → Invoice
Invoice → Payment
Spool → Print Job
Printer → Print Job
Product → Print Profile
Calibration → Print Profile
Complaint → CAPA
R&D → Calibration/Profile

==================================================
69. FINAL SYSTEM AUDIT
==================================================

Before declaring the application complete, perform a full audit.

Check:

Authentication
Authorization
Database
Relationships
CRUD
Forms
Validation
Search
Sorting
Filtering
Pagination
Dashboards
Analytics
Charts
Quotes
Invoices
PDF generation
Payments
Orders
Production
Filament
Printers
Calibration
Print Profiles
R&D
Quality
CAPA
Shipping
Tasks
Documents
Notifications
Responsive UI
Error states
Loading states
Security
Performance

Do not claim completion if something is only mocked.

If a feature cannot be fully implemented, explicitly identify it.

==================================================
70. FINAL ACCEPTANCE CRITERIA
==================================================

The finished application must allow a business owner to perform this entire cycle:

1. Add a customer.
2. Add a lead.
3. Create a quote.
4. Calculate pricing.
5. Generate a professional quote PDF.
6. Convert accepted quote into an order.
7. Record payment.
8. Select product.
9. Select printer.
10. Select filament spool.
11. Select approved print profile.
12. Select approved calibration.
13. Create print job.
14. Track production.
15. Record actual filament usage.
16. Record print result.
17. Perform QC.
18. Record defects if applicable.
19. Trigger reprint/CAPA if necessary.
20. Package product.
21. Create shipment.
22. Generate invoice.
23. Record payment.
24. Mark order delivered.
25. Collect customer feedback.
26. Analyze product quality.
27. Analyze printer performance.
28. Analyze material consumption.
29. Analyze profitability.
30. Feed failures into R&D.
31. Convert validated improvements into new calibration/profile standards.

This entire workflow must be connected.

==================================================
71. MOST IMPORTANT RULE
==================================================

BUILD THE ACTUAL PRODUCT.

Do not create:

• static mockups
• fake buttons
• fake charts
• fake tables
• fake CRUD
• hardcoded analytics
• disconnected pages

Every important button should perform a real action.

Every important record should be stored in the database.

Every important relationship should work.

Every KPI should be calculated from real database data.

Every chart should use real data.

Every document generator should produce an actual document.

Every status transition should update the underlying record.

==================================================
72. FINAL UX TARGET
==================================================

The final application should feel like a combination of:

Notion
+
Zoho
+
Odoo
+
Shopify
+
Manufacturing MES
+
Quality Management System

but specifically optimized for a 3D printing business.

The user should be able to open the application in the morning and immediately understand:

WHAT NEEDS ATTENTION
WHAT IS BEING PRODUCED
WHAT IS SELLING
WHAT IS MAKING MONEY
WHAT IS FAILING
WHAT MATERIAL IS LOW
WHICH PRINTERS ARE PERFORMING
WHICH CUSTOMERS NEED ATTENTION
WHICH ORDERS ARE DUE
WHICH PAYMENTS ARE PENDING
WHAT QUALITY PROBLEMS EXIST
WHAT SHOULD BE IMPROVED

The application should turn raw operational data into actionable business decisions.

==================================================
73. FINAL DELIVERABLE
==================================================

At completion provide:

1. Application architecture
2. Database schema
3. Page/module map
4. Implemented features
5. Remaining limitations
6. Environment variables required
7. Setup instructions
8. Deployment instructions
9. Test results
10. Known issues

Most importantly:

DO NOT STOP AT THE UI.

CONTINUE UNTIL THE CORE BUSINESS WORKFLOWS ARE ACTUALLY FUNCTIONAL.