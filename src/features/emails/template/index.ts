import ContactTemplate from "../../../../emails/components/ContactTemplate";
import CateringTemplate from "../../../../emails/components/CateringTemplate";
import VerificationTemplate from "../../../../emails/components/VerificationTemplate";
import VerifyPaymentTemplate from "../../../../emails/components/VerifyPaymentTemplate";
import InvoiceTemplate from "../../../../emails/components/InvoiceTemplate";
import OrderConfirmationTemplate from "../../../../emails/components/OrderConfirmationTemplate";
import OrderFulfillmentTemplate from "../../../../emails/components/OrderFulfillmentTemplate";
import OrderCancellationRequestTemplate from "../../../../emails/components/OrderCancellationRequestTemplate";
import OrderCancellationTemplate from "../../../../emails/components/OrderCancellationTemplate";

export const templates = {
  contact: ContactTemplate,
  catering: CateringTemplate,
  email_verification: VerificationTemplate,
  verify_payment: VerifyPaymentTemplate,
  invoice: InvoiceTemplate,
  order_confirmation: OrderConfirmationTemplate,
  order_fulfillment: OrderFulfillmentTemplate,
  order_cancellation_request: OrderCancellationRequestTemplate,
  order_cancellation_confirmation: OrderCancellationTemplate,
};
