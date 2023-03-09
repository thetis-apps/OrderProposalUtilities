# Introduction

This application offers functions that may run automatically every time a order proposal is created.

# Installation

You install the application from the connection view in Thetis IMS. The name of the application is 'thetis-ims-order-proposal-utilities'.

# Configuration

In the data document of the context:

```
{
  "OrderProposalUtilities": {
    "createInboundShipment": true
  }
}
```
# Options

#### createInboundShipment

If this field is true, the application will automatically create one or more inbound shipments every time a new order proposal is created.

The application makes one inbound shipment for each future supplier represented in the order proposal. The latest supplier of an item is considered the future supplier. If an item has never before been purchased, it is not included in any inbound shipment.

