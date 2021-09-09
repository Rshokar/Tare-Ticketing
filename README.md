# Tare Ticketing
After working in gravel trucking idustry for two years, one thing was always consistent, end of month billing. During this time the goal is to collect all of your physical paper reciepts, organize them, then bill to the correct customer. With many employees and owner operators the time consuming part is collecting the tickets. To fix that problem I built Tare Ticketing, a gravel trucking dispatch managements system with the goal of automating billing and giving dispatchers better analytics. 

**What this application does:**
Tare ticketing creates a structure where all billing information is shared between parties. This allows all parties to have access to billing data in live time. Additionally this allows us to create on demand invoices generated by Tare. 

**Features:** 
- Account types: Dispatcher, Employee, and Operator
- Dispatch Tickets: Dispatchers can create dispatch tickets which then create job tickets for selected operators or employees. 
- Account heirarchy: Dispatcher account can make employee accounts. Employees can only recieve jobs from their dispatcher.
- Ticket Status: Nowing the status of an job ticket is vital for a dispatcher. 
  - Tare allows dispatchers to keep track of job tickets status. 
  - Tare tracks if a ticket is empty, sent, confirmed, active, or complete.
- Invoicing: Dispatchers and Operators can make invoices for contractors, dispatchers, and operators. Just type in the company name and select a date range. 
- Contractors: Dispatchers and operators can add contractros. 
  - A contractor contains a billing address for invoicing, and rate and operator rates. 
  - Rates are the amount your are biling the contractor while operator rates are how much your are paying owner-operators.  

**Future Changes:** 
Currently Operators cannot create job tickets themself. By adding this feature operators have more freedome to work with contractros without the need for dispatchers. Additionally operators will be able to make invoices for contractors. 

**Technologies Used:**
1. Javascript
2. HTML
3. CSS 
4. Ejs
5. NodeJs
6. MongoDB/Mongoose
