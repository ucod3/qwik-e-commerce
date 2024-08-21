import { component$, useComputed$, useContext } from "@builder.io/qwik";
import { loadStripe } from "@stripe/stripe-js";
import { STORE_CONTEXT, useUser } from "~/routes/layout";

export const CartIcon = component$(() => {
  const userSig = useUser();
  const store = useContext(STORE_CONTEXT);
  const cartQuantitySig = useComputed$(() =>
    store.cart.products.reduce((total, item) => total + item.quantity, 0),
  );
  return (
    <nav class="ml-auto mr-[80px] flex flex-row flex-nowrap md:mr-[60px] 2xl:mr-[20px] ">
      <button
        class="focus-visible:outline-offset disabled:text-disabled-500 disabled:bg-disabled-300 text-primary-700 hover:bg-primary-100 hover:text-primary-800 active:bg-primary-200 active:text-primary-900 bg-primary-700 hover:bg-primary-800 active:bg-primary-900 -ml-0.5 mr-2 inline-flex items-center justify-center gap-2 rounded-md p-2 text-base font-medium text-white hover:text-white focus-visible:outline active:text-white disabled:cursor-not-allowed disabled:bg-transparent disabled:shadow-none disabled:ring-0"
        data-testid="button"
        aria-label="cart icon"
        onClick$={async () => {
              if (userSig.value && store.cart.products.length > 0) {
                const response = await fetch('/api/process-payment', {
                  method: 'POST',
                  body: JSON.stringify({ products: store.cart.products }),
                });
                const { session } = await response.json();
                const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';
                const stripe = await loadStripe(key);
                if (stripe) {
                  await stripe.redirectToCheckout({ sessionId: session.id });
                }
              }
            }
        }>
        <div class="relative inline-flex rounded-full bg-inherit">
          <svg
            viewBox="0 0 24 24"
            data-testid="shopping-cart"
            xmlns="http://www.w3.org/2000/svg"
            class="undefined inline-block h-6 w-6 fill-current"
          >
            <path d="M7 22c-.55 0-1.02-.196-1.412-.587A1.926 1.926 0 0 1 5 20c0-.55.196-1.02.588-1.413A1.926 1.926 0 0 1 7 18c.55 0 1.02.196 1.412.587C8.804 18.98 9 19.45 9 20s-.196 1.02-.588 1.413A1.926 1.926 0 0 1 7 22Zm10 0c-.55 0-1.02-.196-1.412-.587A1.926 1.926 0 0 1 15 20c0-.55.196-1.02.588-1.413A1.926 1.926 0 0 1 17 18c.55 0 1.02.196 1.413.587.391.392.587.863.587 1.413s-.196 1.02-.587 1.413A1.926 1.926 0 0 1 17 22ZM6.15 6l2.4 5h7l2.75-5H6.15ZM7 17c-.75 0-1.317-.33-1.7-.988-.383-.658-.4-1.312-.05-1.962L6.6 11.6 3 4H1.975a.927.927 0 0 1-.7-.288A.99.99 0 0 1 1 3c0-.283.096-.52.288-.712A.968.968 0 0 1 2 2h1.625c.183 0 .358.05.525.15a.93.93 0 0 1 .375.425L5.2 4h14.75c.45 0 .758.167.925.5.167.333.158.683-.025 1.05l-3.55 6.4a2.034 2.034 0 0 1-.725.775A1.93 1.93 0 0 1 15.55 13H8.1L7 15h11.025c.283 0 .517.096.7.287.183.192.275.43.275.713s-.096.52-.288.712A.968.968 0 0 1 18 17H7Z"></path>
          </svg>
          <div class="pointer-events-none absolute right-0 top-0 -translate-y-1/2 translate-x-1/2 rounded-[inherit] bg-inherit p-0.5">
            <div class="text-3xs min-w-[0.75rem] rounded-[inherit] bg-white px-1 text-center font-medium text-neutral-900">
              {cartQuantitySig.value}
            </div>
          </div>
        </div>
      </button>
    </nav>
  );
});
