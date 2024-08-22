import type { DocumentHead } from "@builder.io/qwik-city";
import { $, component$, useContext, useSignal } from "@builder.io/qwik";
import { routeLoader$, server$, useNavigate } from "@builder.io/qwik-city";
import type { Orama } from "@orama/orama";
import { create, insert, search } from "@orama/orama";
import { IconShoppingCart } from "~/components/IconShoppingCart";
import { supabaseClient } from "~/utils/supabase";
import { STORE_CONTEXT } from "./layout";
import type { Product } from '~/utils/store';

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


let oramaDb: Orama;
export const useProducts = routeLoader$(async () => {
  const { data } = await supabaseClient.from("products").select("*");
  oramaDb = await create({
    schema: {
      id: "string",
      name: "string",
      description: "string",
      price: "number",
      image: "string",
    },
  });
  if (data) {
    data.map(async (product: Product) => {
      await insert(oramaDb, {
        ...product,
        id: product.id.toString(),
      });
    });
  }
  return data as Product[];
});

export const execSearch = server$(async (term: string) => {
  const response = await search(oramaDb, {
    term,
    properties: "*",
    boost: { name: 1.5 },
    tolerance: 2,
  });
  return response;
});

export default component$(() => {
  const userSig = useUser();
  const termSig = useSignal("");
  const productsSig = useProducts();
  const navigate = useNavigate();
  const resultsSig = useSignal<Product[]>(productsSig.value);
  const store = useContext(STORE_CONTEXT);

  const onSearch = $(async (term: string) => {
    if (term === "") {
      resultsSig.value = productsSig.value;
      return;
    }
    const response = await execSearch(term);
    resultsSig.value = response.hits.map(
      (hit) => hit.document as unknown as Product,
    );
  });
  return (
    <div class="flex flex-col items-center p-4">
      Welcome{" "}
      {userSig.value ? userSig.value.email : "guest"} 👋!
      <div class="w-[400px] py-4">
        <label class="mb-2 block text-center text-lg font-medium text-gray-600">
          Search - eg. plant, water, hot
        </label>
        <input
          type="text"
          class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2 text-gray-600"
          bind:value={termSig}
          onKeyDown$={(e) => {
            if (e.key === "Enter") {
              onSearch(termSig.value);
            }
          }}
        />
      </div>
      <div class="mx-auto mt-8 flex max-w-[1000px] flex-wrap items-center justify-between gap-4">
        {resultsSig.value.map((product) => (
          <div
            key={product.id}
            class="w-[280px] min-w-[280px] max-w-[280px] flex-auto flex-shrink-0 rounded-md border border-neutral-200 hover:shadow-lg"
          >
            <div class="relative">
              <div class="focus-visible:outline-offset relative block w-[280px] p-1 text-blue-700 underline hover:text-blue-800 focus-visible:rounded-sm focus-visible:outline active:text-blue-900">
                <img
                  loading="eager"
                  width={280}
                  height={280}
                  class="aspect-square h-full w-full cursor-pointer rounded-md object-cover"
                  src={`/images/${product.image}`}
                  alt={product.name}
                  onClick$={() => {
                    navigate(`/detail/${product.slug}`);
                  }}
                />
              </div>
            </div>
            <div class="typography-text-sm border-t border-neutral-200 p-2 px-6 py-4">
              <span class="focus-visible:outline-offset text-md text-bold text-gray-900 no-underline hover:text-blue-800 focus-visible:rounded-sm focus-visible:outline active:text-blue-900">
                {product.name}
              </span>
              <div class="focus-visible:outline-offset h-[120px] text-sm text-gray-600 no-underline hover:text-blue-800 focus-visible:rounded-sm focus-visible:outline active:text-blue-900">
                {product.description}
              </div>
              <p class="typography-text-xs block py-2 text-justify font-normal text-neutral-700"></p>
              <div class="flex items-center justify-between">
                <span class="typography-text-sm block font-bold">
                  $ {product.price}
                </span>
                {userSig.value ? (
                  <button
                    type="button"
                    class={[
                      "inline-flex items-center justify-center font-medium",
                      "focus-visible:outline-offset disabled:text-disabled-500 rounded-md focus-visible:outline",
                      "disabled:bg-disabled-300 leading-5 disabled:cursor-not-allowed disabled:shadow-none disabled:ring-0",
                      "gap-1.5 px-3 py-1.5 text-sm text-white shadow hover:shadow-md active:shadow",
                      "disabled:bg-disabled-300 bg-blue-700 hover:bg-blue-800 active:bg-blue-900",
                    ]}
                    onClick$={() => {
                      const cartProduct = [...store.cart.products].find(
                        (p) => p.id === product.id,
                      );
                      if (cartProduct) {
                        cartProduct.quantity += 1;
                        store.cart.products = [...store.cart.products];
                      } else {
                        store.cart.products = [
                          ...store.cart.products,
                          { ...product, quantity: 1 },
                        ];
                      }
                    }}
                  >
                    <IconShoppingCart />
                    Add to cart
                  </button>
                ) : (
                  <button
                    type="button"
                    class={[
                      "inline-flex items-center justify-center font-medium",
                      "focus-visible:outline-offset disabled:text-disabled-500 rounded-md focus-visible:outline",
                      "disabled:bg-disabled-300 leading-5 disabled:cursor-not-allowed disabled:shadow-none disabled:ring-0",
                      "gap-1.5 px-3 py-1.5 text-sm text-white shadow hover:shadow-md active:shadow",
                      "disabled:bg-disabled-300 bg-blue-700 hover:bg-blue-800 active:bg-blue-900",
                    ]}
                    onClick$={() => navigate("/sign-in")}
                  >
                    Sign In
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Welcome to Qwik",
  meta: [
    {
      name: "description",
      content: "Qwik site description",
    },
  ],
};
