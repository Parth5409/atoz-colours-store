import { Module } from "@medusajs/framework/utils";
import RazorpayProviderService from "@sgftech/payment-razorpay/dist/services/razorpay-provider";
import { MedusaError } from "@medusajs/framework/utils";

// Installed package version: 2.1.11

export class RazorpayPatchedService extends RazorpayProviderService {
  static identifier = "razorpay-patched";

  async initiatePayment(input: any): Promise<any> {
    const intentRequestData = this.getPaymentIntentOptions();
    const { currency_code, amount } = input;
    const { extra } = input.context;
    const cart = extra;

    if (!cart) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "cart not ready",
        MedusaError.Codes.CART_INCOMPATIBLE_STATE
      );
    }

    const provider = (this as any).options_.providers?.find(
      (p: any) => p.id == RazorpayPatchedService.identifier
    );

    if (!provider && !(this as any).options_.key_id) {
      throw new MedusaError(
        MedusaError.Types.INVALID_ARGUMENT,
        "razorpay not configured",
        MedusaError.Codes.CART_INCOMPATIBLE_STATE
      );
    }

    const sessionNotes = extra?.notes ?? {};

    // PATCH: Medusa already passes `amount` in the smallest unit (paise).
    // The upstream package erroneously converted to standard unit then multiplied by 10000.
    // We just parse it cleanly and pass it directly to Razorpay, which expects smallest unit.
    const toPay = Math.round(parseInt(amount.toString()));

    const intentRequest: any = {
      amount: toPay,
      currency: currency_code.toUpperCase(),
      notes: {
        ...sessionNotes,
        resource_id: extra?.resource_id ?? "",
        session_id: input.context.session_id,
        cart_id: extra?.id,
      },
      payment: {
        capture:
          (this as any).options_.auto_capture ?? provider?.options.auto_capture
            ? "automatic"
            : "manual",
        capture_options: {
          refund_speed:
            (this as any).options_.refund_speed ??
            provider?.options.refund_speed ??
            "normal",
          automatic_expiry_period: Math.max(
            (this as any).options_.automatic_expiry_period ??
              provider?.options.automatic_expiry_period ??
              20,
            12
          ),
          manual_expiry_period: Math.max(
            (this as any).options_.manual_expiry_period ??
              provider?.options.manual_expiry_period ??
              10,
            7200
          ),
        },
      },
      ...intentRequestData,
    };

    let session_data;
    const customerDetails = input.context.customer ?? extra.customer;

    try {
      const razorpayCustomer = await this.createOrUpdateCustomer(
        intentRequest,
        customerDetails,
        extra
      );
      try {
        if (razorpayCustomer) {
          this.logger.debug(`the intent: ${JSON.stringify(intentRequest)}`);
        } else {
          this.logger.error("unable to find razorpay customer");
        }
        const phoneNumber =
          customerDetails.phone ?? cart.billing_address?.phone;

        if (!phoneNumber) {
          const e = new MedusaError(
            MedusaError.Types.INVALID_DATA,
            "no phone number",
            MedusaError.Codes.CART_INCOMPATIBLE_STATE
          );
          return (this as any).buildError(
            "An error occurred in InitiatePayment during the " +
              "invalid phone number: " +
              JSON.stringify(e),
            e
          );
        }

        session_data = await (this as any).razorpay_.orders.create({
          ...intentRequest,
        });
      } catch (e: any) {
        return (this as any).buildError(
          "An error occurred in InitiatePayment during the " +
            "creation of the razorpay payment intent: " +
            JSON.stringify(e),
          e
        );
      }
    } catch (e: any) {
      return (this as any).buildError(
        "An error occurred in creating customer request:" + e.message,
        e
      );
    }

    return {
      data: { ...session_data, intentRequest: intentRequest },
    };
  }
}

import { ModuleProvider, Modules } from "@medusajs/framework/utils";
export const RAZORPAY_PATCHED_MODULE = "payment-razorpay-patched";

export default ModuleProvider(Modules.PAYMENT, {
  services: [RazorpayPatchedService],
});
