# Introduction

This application offers functions that may run automatically every time a order proposal is created.

# Installation

You install the application from the connection view in Thetis IMS. The name of the application is 'thetis-ims-order-proposal-utilities'.

# Configuration

In the data document of the context:

```
{
  "OrderProposalUtilities": {
    "createPurchaseOrders": true
  }
}
```
# Options

#### createPurchaseOrders

If this field is true, the application will automatically create one or more purchase order every time a new order proposal is created.

The application makes one purchase order for each supplier represented in the order proposal.


