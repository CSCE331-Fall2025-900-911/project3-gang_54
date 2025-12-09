# Cashier Interface Access Guide

## Where is the Cashier Interface?

The cashier interface is located at:
- **URL:** `/cashier` or `https://project3-gang54.vercel.app/cashier`
- **Direct access:** You can navigate directly to this URL

## How to Access the Cashier Interface

### Option 1: Direct URL Access
1. Go to: `https://project3-gang54.vercel.app/cashier`
2. If you're not logged in, you'll be redirected to login
3. If you're logged in but don't have the cashier role, you'll be redirected based on your role:
   - Managers → `/dashboard`
   - Customers → `/` (home)

### Option 2: Navigation Bar (After Login)
1. Log in with a Google account that has the **cashier** role
2. The navigation bar will show a "Cashier" link
3. Click it to go to `/cashier`

### Option 3: Auto-Redirect After Login
1. Log in with a Google account that has the **cashier** role
2. You'll be automatically redirected to `/cashier` after successful login

## How to Assign Cashier Role

To make a user a cashier, you need to add their email to the `ROLE_DIRECTORY` in:
**File:** `my-app/app/api/auth/google/route.ts`

```typescript
const ROLE_DIRECTORY: Record<string, "manager" | "cashier" | "customer"> = {
  "reveille.bubbletea@gmail.com": "manager",
  "your-cashier-email@gmail.com": "cashier",  // Add this line
  // ... other emails
};
```

After adding the email:
1. Commit and push the changes
2. The user needs to log out and log back in
3. They will then have access to the cashier interface

## Cashier Interface Features

Once you have cashier access, you'll see:

1. **Cashier Dashboard** (`/cashier`)
   - View Orders button
   - Process Payment button
   - Order History button

2. **Process Payment** (`/cashier/process-payment`)
   - View pending orders
   - Select an order to process payment
   - Choose payment method (Cash, Credit, Debit, Mobile Pay, Gift Card)
   - Process payments

3. **Order History** (`/cashier/order-history`)
   - View all past orders
   - See order details with customizations
   - View order totals and timestamps

## Testing the Cashier Interface

To test without assigning a real email:
1. Add a test email to `ROLE_DIRECTORY` with `"cashier"` role
2. Log in with that Google account
3. You'll be redirected to `/cashier` automatically

