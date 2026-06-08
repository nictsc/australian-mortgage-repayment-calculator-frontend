## URLs

- Frontend — https://aussiemortgagerepaymentcalculator.netlify.app
- Backend — https://github.com/nictsc/australian-mortgage-repayment-calculator-backend

## Concept

The Australian Mortgage Repayment Calculator is a tool for Australians to estimate and stress-test their home loan repayments. Users can model different loan types, repayment frequencies and offset accounts; then see their balance fall over time on a graph or drill into a full repayment schedule. Signed-in users can save and reload scenarios to compare different loan options side by side.

## Intended Audience / User Stories

- **Guest users**
    - Unauthenticated users.
    - They can calculate repayments and view the graph and schedule table.
    - Their main goal is to quickly estimate what a loan will cost them.

- **Signed-in users**
    - Authenticated via Auth0.
    - They can save, reload and delete named scenarios.
    - Their main goal is to compare multiple loan options and return to them later.

## Front End Pages / Functionality

- **Calculator Page**
    - Functionality
        - Enter loan details and calculate repayments
        - Toggle between a balance chart and a full repayment schedule table
        - Save the current scenario (authenticated users only)
        - Load a previously saved scenario from the Saved Scenarios page
    - Front End Elements
        - Loan amount, term, annual rate, repayment frequency inputs
        - Rate type selector (variable / fixed / interest-only)
        - Repayment type selector (principal & interest / interest only)
        - Offset amount input
        - Summary cards showing repayment amount, total interest, and total repayment
        - Loan balance chart with phase transition markers
        - Repayment schedule table with yearly summary and per-period drill-down
        - Save scenario modal with name input

- **Saved Scenarios Page**
    - Functionality
        - View all saved scenarios
        - Load a scenario back into the calculator
        - Delete a scenario
    - Front End Elements
        - Scenario cards showing loan amount, rate, term, and repayment frequency
        - Load and Delete buttons per card
        - Empty state message when no scenarios are saved

- **Login Page**
    - Functionality
        - Redirect to Auth0 login
    - Front End Elements
        - Sign in button
        - Link to sign up

- **Sign Up Page**
    - Functionality
        - Redirect to Auth0 sign up screen
    - Front End Elements
        - Sign up button
        - Link to sign in

