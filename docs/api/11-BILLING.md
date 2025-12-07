# Billing API

**Base Path**: `/api/v1/workspaces/:workspaceId/billing`

## Endpoints Overview

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/subscription` | Get current subscription | Yes | Admin |
| POST | `/subscription` | Create subscription | Yes | Owner |
| PATCH | `/subscription` | Update subscription | Yes | Owner |
| DELETE | `/subscription` | Cancel subscription | Yes | Owner |
| GET | `/plans` | List available plans | Yes | Member |
| GET | `/invoices` | List invoices | Yes | Admin |
| GET | `/invoices/:id` | Get invoice details | Yes | Admin |
| GET | `/payment-methods` | List payment methods | Yes | Admin |
| POST | `/payment-methods` | Add payment method | Yes | Owner |
| DELETE | `/payment-methods/:id` | Remove payment method | Yes | Owner |
| GET | `/usage` | Get usage metrics | Yes | Admin |
| POST | `/portal` | Get Stripe portal link | Yes | Owner |

---

## GET /subscription

Get current subscription details.

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "sub_1234567890",
    "plan": {
      "id": "professional",
      "name": "Professional",
      "price_monthly": 2900,
      "price_yearly": 29000,
      "currency": "usd"
    },
    "status": "active",
    "billing_cycle": "monthly",
    "current_period": {
      "start": "2024-03-01",
      "end": "2024-03-31"
    },
    "seats": {
      "included": 10,
      "used": 5,
      "additional_price": 1000
    },
    "features": {
      "products_limit": 25,
      "products_used": 3,
      "storage_gb_limit": 50,
      "storage_gb_used": 12.5,
      "api_calls_limit": 100000,
      "api_calls_used": 45000
    },
    "payment_method": {
      "type": "card",
      "brand": "visa",
      "last4": "4242",
      "exp_month": 12,
      "exp_year": 2025
    },
    "next_invoice": {
      "amount": 2900,
      "date": "2024-04-01"
    },
    "created_at": "2024-01-15T10:00:00Z"
  }
}
```

---

## POST /subscription

Create a new subscription.

### Request

```json
{
  "plan_id": "professional",
  "billing_cycle": "yearly",
  "payment_method_id": "pm_1234567890",
  "seats": 10
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| plan_id | string | Yes | free, starter, professional, enterprise |
| billing_cycle | string | Yes | monthly, yearly |
| payment_method_id | string | Yes | Valid Stripe payment method |
| seats | integer | No | Number of seats (min based on plan) |

### Response (201 Created)

```json
{
  "success": true,
  "data": {
    "id": "sub_1234567890",
    "plan": {
      "id": "professional",
      "name": "Professional"
    },
    "status": "active",
    "billing_cycle": "yearly",
    "amount": 29000,
    "currency": "usd",
    "current_period": {
      "start": "2024-03-10",
      "end": "2025-03-10"
    },
    "created_at": "2024-03-10T10:00:00Z"
  }
}
```

### Errors

| Code | Error | Description |
|------|-------|-------------|
| 400 | PAYMENT_FAILED | Payment method declined |
| 400 | INVALID_PLAN | Plan doesn't exist |
| 409 | ALREADY_SUBSCRIBED | Active subscription exists |

---

## PATCH /subscription

Update subscription (upgrade/downgrade).

### Request

```json
{
  "plan_id": "enterprise",
  "seats": 25
}
```

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "sub_1234567890",
    "previous_plan": "professional",
    "new_plan": "enterprise",
    "proration": {
      "amount": 5000,
      "description": "Prorated upgrade for remaining period"
    },
    "effective_date": "2024-03-10",
    "updated_at": "2024-03-10T10:00:00Z"
  }
}
```

---

## DELETE /subscription

Cancel subscription.

### Request

```json
{
  "reason": "Not using all features",
  "feedback": "Great product, just not the right fit for our team size",
  "cancel_at_period_end": true
}
```

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "sub_1234567890",
    "status": "canceled",
    "cancel_at_period_end": true,
    "cancels_at": "2024-03-31T23:59:59Z",
    "access_until": "2024-03-31T23:59:59Z"
  }
}
```

---

## GET /plans

List all available subscription plans.

### Response (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": "free",
      "name": "Free",
      "description": "For individuals and small teams getting started",
      "price_monthly": 0,
      "price_yearly": 0,
      "currency": "usd",
      "features": {
        "seats": 3,
        "products": 1,
        "features_per_product": 10,
        "storage_gb": 1,
        "api_calls": 1000,
        "support": "community",
        "integrations": false,
        "analytics": "basic",
        "custom_fields": false,
        "audit_logs": false
      },
      "popular": false
    },
    {
      "id": "starter",
      "name": "Starter",
      "description": "For growing teams with basic needs",
      "price_monthly": 1500,
      "price_yearly": 15000,
      "currency": "usd",
      "features": {
        "seats": 5,
        "products": 5,
        "features_per_product": 50,
        "storage_gb": 10,
        "api_calls": 10000,
        "support": "email",
        "integrations": true,
        "analytics": "standard",
        "custom_fields": true,
        "audit_logs": false
      },
      "popular": false
    },
    {
      "id": "professional",
      "name": "Professional",
      "description": "For professional teams that need more power",
      "price_monthly": 2900,
      "price_yearly": 29000,
      "currency": "usd",
      "features": {
        "seats": 10,
        "products": 25,
        "features_per_product": "unlimited",
        "storage_gb": 50,
        "api_calls": 100000,
        "support": "priority",
        "integrations": true,
        "analytics": "advanced",
        "custom_fields": true,
        "audit_logs": true
      },
      "popular": true
    },
    {
      "id": "enterprise",
      "name": "Enterprise",
      "description": "For large organizations with advanced needs",
      "price_monthly": null,
      "price_yearly": null,
      "currency": "usd",
      "contact_sales": true,
      "features": {
        "seats": "unlimited",
        "products": "unlimited",
        "features_per_product": "unlimited",
        "storage_gb": "unlimited",
        "api_calls": "unlimited",
        "support": "dedicated",
        "integrations": true,
        "analytics": "enterprise",
        "custom_fields": true,
        "audit_logs": true,
        "sso": true,
        "custom_contracts": true,
        "sla": "99.9%"
      },
      "popular": false
    }
  ]
}
```

---

## GET /invoices

List billing invoices.

### Query Parameters

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| page | integer | 1 | Page number |
| limit | integer | 20 | Items per page |
| status | string | - | paid, pending, failed |
| from_date | date | - | Start date |
| to_date | date | - | End date |

### Response (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": "inv_1234567890",
      "number": "INV-2024-0003",
      "amount": 2900,
      "currency": "usd",
      "status": "paid",
      "period": {
        "start": "2024-03-01",
        "end": "2024-03-31"
      },
      "paid_at": "2024-03-01T10:00:00Z",
      "pdf_url": "https://stripe.com/invoices/inv_1234567890.pdf",
      "created_at": "2024-03-01T00:00:00Z"
    },
    {
      "id": "inv_1234567891",
      "number": "INV-2024-0002",
      "amount": 2900,
      "currency": "usd",
      "status": "paid",
      "period": {
        "start": "2024-02-01",
        "end": "2024-02-29"
      },
      "paid_at": "2024-02-01T10:00:00Z",
      "pdf_url": "https://stripe.com/invoices/inv_1234567891.pdf",
      "created_at": "2024-02-01T00:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 3,
    "total_pages": 1
  }
}
```

---

## GET /invoices/:id

Get invoice details.

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "inv_1234567890",
    "number": "INV-2024-0003",
    "status": "paid",
    "amount_due": 2900,
    "amount_paid": 2900,
    "currency": "usd",
    "period": {
      "start": "2024-03-01",
      "end": "2024-03-31"
    },
    "line_items": [
      {
        "description": "Professional Plan - Monthly",
        "quantity": 1,
        "unit_price": 2900,
        "amount": 2900
      }
    ],
    "subtotal": 2900,
    "tax": 0,
    "total": 2900,
    "payment_method": {
      "type": "card",
      "brand": "visa",
      "last4": "4242"
    },
    "paid_at": "2024-03-01T10:00:00Z",
    "pdf_url": "https://stripe.com/invoices/inv_1234567890.pdf",
    "hosted_invoice_url": "https://invoice.stripe.com/i/inv_1234567890",
    "created_at": "2024-03-01T00:00:00Z"
  }
}
```

---

## GET /payment-methods

List saved payment methods.

### Response (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": "pm_1234567890",
      "type": "card",
      "card": {
        "brand": "visa",
        "last4": "4242",
        "exp_month": 12,
        "exp_year": 2025
      },
      "is_default": true,
      "created_at": "2024-01-15T10:00:00Z"
    },
    {
      "id": "pm_1234567891",
      "type": "card",
      "card": {
        "brand": "mastercard",
        "last4": "5555",
        "exp_month": 6,
        "exp_year": 2026
      },
      "is_default": false,
      "created_at": "2024-02-20T10:00:00Z"
    }
  ]
}
```

---

## POST /payment-methods

Add a new payment method.

### Request

```json
{
  "payment_method_id": "pm_1234567892",
  "set_as_default": true
}
```

### Response (201 Created)

```json
{
  "success": true,
  "data": {
    "id": "pm_1234567892",
    "type": "card",
    "card": {
      "brand": "amex",
      "last4": "3782",
      "exp_month": 9,
      "exp_year": 2027
    },
    "is_default": true,
    "created_at": "2024-03-10T10:00:00Z"
  }
}
```

---

## DELETE /payment-methods/:id

Remove a payment method.

### Response (200 OK)

```json
{
  "success": true,
  "message": "Payment method removed"
}
```

### Errors

| Code | Error | Description |
|------|-------|-------------|
| 400 | CANNOT_REMOVE_DEFAULT | Add another default first |
| 400 | ACTIVE_SUBSCRIPTION | Payment method is in use |

---

## GET /usage

Get current usage metrics.

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "period": {
      "start": "2024-03-01",
      "end": "2024-03-31"
    },
    "seats": {
      "included": 10,
      "used": 5,
      "available": 5
    },
    "products": {
      "limit": 25,
      "used": 3,
      "available": 22
    },
    "storage": {
      "limit_gb": 50,
      "used_gb": 12.5,
      "available_gb": 37.5,
      "usage_percentage": 25
    },
    "api_calls": {
      "limit": 100000,
      "used": 45000,
      "available": 55000,
      "usage_percentage": 45
    },
    "features": {
      "total": 89,
      "limit": null
    },
    "history": {
      "api_calls": [
        { "date": "2024-03-01", "count": 1500 },
        { "date": "2024-03-02", "count": 1800 },
        { "date": "2024-03-03", "count": 1200 }
      ],
      "storage": [
        { "date": "2024-03-01", "gb": 12.0 },
        { "date": "2024-03-05", "gb": 12.3 },
        { "date": "2024-03-10", "gb": 12.5 }
      ]
    }
  }
}
```

---

## POST /portal

Get Stripe customer portal link for self-service billing management.

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "url": "https://billing.stripe.com/session/cs_1234567890",
    "expires_at": "2024-03-10T11:00:00Z"
  }
}
```
