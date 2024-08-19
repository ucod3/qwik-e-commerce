import {
  component$,
  createContextId,
  Slot,
  useContextProvider,
  useStore,
} from "@builder.io/qwik";
import { routeLoader$ } from "@builder.io/qwik-city";
import { NavbarTop } from "~/components/NavbarTop";
import type { Store } from "~/utils/store";
import { supabaseClient } from "~/utils/supabase";
import type { RequestHandler } from "@builder.io/qwik-city";

export const onGet: RequestHandler = async ({ cacheControl }) => {
  // Control caching for this request for best performance and to reduce hosting costs:
  // https://qwik.dev/docs/caching/
  cacheControl({
    // Always serve a cached response by default, up to a week stale
    staleWhileRevalidate: 60 * 60 * 24 * 7,
    // Max once every 5 seconds, revalidate on the server to get a fresh version of this page
    maxAge: 5,
  });
};



export const useUser = routeLoader$(async (requestEv) => {
  const supabaseAccessToken = requestEv.cookie.get("supabase_access_token");
  if (!supabaseAccessToken) {
    return null;
  }
  const { data, error } = await supabaseClient.auth.getUser(
    supabaseAccessToken.value,
  );
  return error ? null : data.user;
});

export const STORE_CONTEXT = createContextId<Store>("STORE_CONTEXT");

const initialData: Store = {
  cart: {
    products: [],
  },
};

export default component$(() => {
  const store = useStore<Store>(initialData, { deep: true });
  useContextProvider(STORE_CONTEXT, store);

  return (
    <div>
      <NavbarTop />
      <Slot />
    </div>
  );
});
