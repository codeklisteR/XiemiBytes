

# USE MOCK DATA TO LOG IN:
(Any password will do)

staff: staff@xiemibytes.com
manager: manager@xiemibytes.com
superadmin: superadmin@xiemibytes.com
customer: any email address




# FOR FRONTEND IMPROVEMENT:

System Improvement Plan: Customer & Admin Portals

Customer Side: UI & UX Refinement
* **Orders Page Layout:**
    * Group orders by status (Pending, Preparing, Completed).
    * Use **Cards** instead of a simple list to show item previews, total price, and order date at a glance.
* **Registration Form Alignment:**
    * Center the form container or use a grid system to fix "lopsided" labels.
* **Auth Cleanup:**
    * **Action:** Remove the "Login as Admin" button from the public login page.
    * *Tip:* Admins should use a hidden route (e.g., `/admin-portal`) to keep the customer UI focused.


Admin Side: Dashboard & Management
1. Dashboard Enhancements
* **"Upcoming Orders" Section:** Add a real-time list showing the latest 5-10 pending orders.
* **Key Metrics:** Display total sales for the day and the number of active orders.

2. POS System Fixes
* **Customization Options:** Add a modal or dropdown that appears when a drink is clicked (e.g., Sugar Level, Add-ons).
* **Stable Order ID:**
    * **The Problem:** The ID changes on every click because it is likely re-generating on render.
    * **The Fix:** Generate the `Order_ID` only once when a "New Transaction" starts. Keep it static until the "Checkout" button is pressed.

3. Order Management & Receipts
* **Receipt Layout:** Format "Order Details" to mimic a thermal receipt (Monospace font, dashed lines, clear Breakdown: Subtotal, Tax, Total).
* **Payment Tracking:** Add a toggle or badge for **Paid** vs. **Unpaid**.
* **Search/Filter:** Add a search bar to filter by **Order ID** or **Customer Name**.

4. Product Management
* **Bulk Variation Edit:** Ensure the "Save" function maps through all price variations linked to a Product ID, not just the first one.
* **Availability Toggle:** Add a "Status" column (Active vs. Deactivated/Not Available).

---

# QR Code Implementation Guide

To implement the QR code system for order verification, you need to bridge the gap between the **Customer’s device** (generator) and the **Admin’s POS** (scanner).

## 1. Technical Workflow
| Step | Component | Action |
| :--- | :--- | :--- |
| **1. Create** | Database | Order is saved; a unique `order_id` is generated. |
| **2. Encode** | Customer UI | A QR library converts the `order_id` into a scannable image. |
| **3. Scan** | Admin POS | Staff uses a camera library to read the customer's screen. |
| **4. Fetch** | Backend/API | POS sends the scanned `order_id` to the database to retrieve details. |
| **5. Display** | Admin UI | The "Receipt" view pops up with "Paid/Unpaid" status and items. |

## 2. Implementation Steps

### A. Generation (Customer Side)
Once the customer places an order, use a library like `qrcode.react` (React) or `qrcode.js` (Vanilla JS) to generate the code.
* **Data to Encode:** Use a string containing the Order ID.
* **Example Code (JavaScript):**
    ```javascript
         // Example Order ID
         const orderId = "ORD-99283-X";

         // Initialize the QR Code
         const qrcode = new QRCode(document.getElementById("qrcode-container"), {
             text: orderId,         // The data to encode
             width: 256,            // Width of the QR code
             height: 256,           // Height of the QR code
             colorDark : "#000000", // Foreground color
             colorLight : "#ffffff",// Background color
             correctLevel : QRCode.CorrectLevel.H // Error correction level
         });
    ```

### B. Verification (Admin Side)
The Admin POS needs a "Scan" mode that accesses the device camera.
* **Library Recommendation:** `html5-qrcode` or `react-qr-reader`.
* **Logic:**
    1.  Staff clicks "Scan QR" in the POS.
    2.  The library extracts the `order_id` from the scan.
    3.  The system automatically runs a search function using that `order_id`.
    4.  The UI populates the order details on the screen for the staff to verify.

## 3. Important Considerations
* **Database Requirement:** The `order_id` must be stored in a shared database (like Firebase, Supabase, or MySQL) so the Admin's device can find the data created by the Customer's device.
* **Manual Fallback:** Always provide a search bar where the staff can manually type the Order ID if the QR code won't scan (e.g., due to a broken screen).
