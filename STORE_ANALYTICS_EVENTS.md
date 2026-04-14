# Shoper Storefront Analytics Events (Theme1 + Theme3)

This document explains all storefront tracking events currently implemented for GTM/GA4.

## Common Parameters (sent across events)

- `store_slug`: tenant slug (main filter for multi-tenant reporting)
- `tenant_slug`: same as `store_slug` (backup naming)
- `store_theme`: `theme1` or `theme3` (when available)
- `ecommerce`: included for ecommerce funnel events

## Events

### `storefront_context`
- **Purpose**: Initializes storefront context in `dataLayer`.
- **When it fires**: On `[slug]` layout load before route tracking.
- **Key params**: `store_slug`, `tenant_slug`, `store_theme`, `ga4_measurement_id`.

### `store_page_view`
- **Purpose**: Custom page-view event for SPA navigation.
- **When it fires**: On route/path/search change.
- **Key params**: `store_slug`, `store_theme`, `page_type`, `page_path`, `page_location`, `page_title`.

### `view_item_list`
- **Purpose**: User viewed a product list.
- **When it fires**: On home featured products and product listing pages.
- **Key params**: `store_slug`, `store_theme`, `item_list_name`, `ecommerce.items`.

### `select_item`
- **Purpose**: User clicked a product from a listing/card.
- **When it fires**: Product card click to product detail.
- **Key params**: `store_slug`, `store_theme`, `item_list_name`, `ecommerce.items`.

### `view_item`
- **Purpose**: Product detail page view.
- **When it fires**: Product detail component loads.
- **Key params**: `store_slug`, `store_theme`, `ecommerce.value`, `ecommerce.items`.

### `add_to_cart`
- **Purpose**: Product quantity increased.
- **When it fires**: Add from card/detail and cart quantity increment.
- **Key params**: `store_slug`, `store_theme`, `ecommerce.value`, `ecommerce.items`.

### `remove_from_cart`
- **Purpose**: Product quantity decreased/removed.
- **When it fires**: Cart decrement and remove item action.
- **Key params**: `store_slug`, `store_theme`, `ecommerce.value`, `ecommerce.items`.

### `view_cart`
- **Purpose**: Cart viewed.
- **When it fires**: First cart render with items.
- **Key params**: `store_slug`, `store_theme`, `ecommerce.value`, `ecommerce.items`, `ecommerce.coupon` (if applied).

### `proceed_to_checkout_click`
- **Purpose**: User clicked checkout from cart.
- **When it fires**: Checkout button click in cart page.
- **Key params**: `store_slug`, `store_theme`, `ecommerce.value`, `ecommerce.items`, `ecommerce.coupon` (if applied).

### `begin_checkout`
- **Purpose**: Checkout flow started.
- **When it fires**: First checkout page render with items.
- **Key params**: `store_slug`, `store_theme`, `ecommerce.value`, `ecommerce.items`, `ecommerce.coupon` (if applied).

### `add_shipping_info`
- **Purpose**: Shipping details submitted/used in checkout flow.
- **When it fires**: Before order/payment requests in checkout.
- **Key params**: `store_slug`, `store_theme`, `country`, `state`, `city`, `ecommerce.items`.

### `add_payment_info`
- **Purpose**: Payment method step captured.
- **When it fires**: Before payment/order API calls.
- **Key params**: `store_slug`, `store_theme`, `payment_type`, `ecommerce.items`.

### `purchase`
- **Purpose**: Completed order/conversion.
- **When it fires**: Checkout success page (from pending purchase payload).
- **Key params**: `store_slug`, `store_theme`, `payment_type`, `transaction_id`, `ecommerce.value`, `ecommerce.currency`, `ecommerce.tax`, `ecommerce.shipping`, `ecommerce.items`, `ecommerce.coupon`.

### `checkout_cancel`
- **Purpose**: Checkout canceled/abandoned at payment step.
- **When it fires**: Checkout cancel page load.
- **Key params**: `store_slug`.

### `generate_lead`
- **Purpose**: Contact lead submission.
- **When it fires**: Store contact form submit.
- **Key params**: `store_slug`, `store_theme`, `lead_type`, `form_name`, `page_type`.

## Recommended GA4 Conversions

- `purchase` (primary)
- `generate_lead` (primary)
- `begin_checkout` (optional funnel KPI)
