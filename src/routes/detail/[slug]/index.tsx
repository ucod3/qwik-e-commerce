import {
  component$,
  useContext,
  useSignal,
  useVisibleTask$,
} from "@builder.io/qwik";
import type { RequestHandler } from "@builder.io/qwik-city";
import {
  routeLoader$,
  server$,
  useLocation,
  useNavigate,
} from "@builder.io/qwik-city";
import type { PostgrestSingleResponse } from "@supabase/supabase-js";
import { HeartIcon } from "~/components/HeartIcon";
import { IconShoppingCart } from "~/components/IconShoppingCart";
import type { Product } from "~/utils/store";
import { STORE_CONTEXT, useUser } from "~/routes/layout";
import { createSupabaseClient } from "~/utils/supabase";

export const onGet: RequestHandler = async ({ params, next, cacheControl, }) => {
  const supabaseClient = await createSupabaseClient();
  await supabaseClient.rpc("increment_views", { page_slug: params.slug });
  await next();
  cacheControl({
    maxAge: 60,
    sMaxAge: 60,
    staleWhileRevalidate: 120
  });
};

export const useProductDetail = routeLoader$(
  async ({ params, resolveValue }) => {
    const slug = params.slug;
    const supabaseClient = await createSupabaseClient();
    const { data }: PostgrestSingleResponse<Product[]> = await supabaseClient
      .from("products")
      .select("*")
      .eq("slug", slug);

    if (!data || data.length === 0) {
      return { product: null, isFavorite: false };
    }

    let isFavorite = false;
    const user = await resolveValue(useUser);
    if (user) {
      const supabaseClient = await createSupabaseClient();
      const favoritesResponse = await supabaseClient
        .from("favorites")
        .select("*")
        .match({ user_id: user.id, product_id: data[0].id });
      isFavorite =
        !!favoritesResponse.data && favoritesResponse.data.length > 0;
    }
    return { product: data[0], isFavorite };
  },
);

export const useCurentViews = routeLoader$(async ({ params }) => {
  const supabaseClient = await createSupabaseClient();
  const { data } = await supabaseClient
    .from("page_views")
    .select("views")
    .eq("page", params.slug);
  return data && data[0] ? data[0].views : 1;
});

export const changeFavorite = server$(
  async (userId: string, productId: number, isFavorite: boolean) => {
    if (isFavorite) {
      const supabaseClient = await createSupabaseClient();
      await supabaseClient
        .from("favorites")
        .insert({ user_id: userId, product_id: productId });
    } else {
      const supabaseClient = await createSupabaseClient();
      await supabaseClient
        .from("favorites")
        .delete()
        .match({ user_id: userId, product_id: productId });
    }
  },
);

export default component$(() => {
  const userSig = useUser();
  const viewsSig = useSignal(useCurentViews().value);
  const navigate = useNavigate();
  const location = useLocation();
  const store = useContext(STORE_CONTEXT);
  const productDetail = useSignal(useProductDetail().value);

  if (!productDetail.value.product) {
    return <div>Sorry, looks like we don't have this product.</div>;
  }

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async ({ cleanup }) => {
    const supabaseClient = await createSupabaseClient();
    const sub = supabaseClient
      .channel("custom-all-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "page_views" },
        async (payload) => {
          if (
            payload.eventType === "UPDATE" &&
            payload.new.page === location.params.slug
          ) {
            const newViews = payload.new.views;
            viewsSig.value = newViews;
          }
        },
      )
      .subscribe();

    cleanup(() => {
      sub.unsubscribe();
    });
  });

  return (
    <div>
      <div class="mx-auto max-w-6xl px-4 py-10">
        <div>
          <h2 class="my-8 text-3xl font-light tracking-tight text-gray-900 sm:text-5xl">
            {productDetail.value.product.name}
          </h2>
          <span class="my-8 text-base font-light tracking-tight text-gray-900">
            Views {viewsSig.value.toString()}
          </span>
          <div class="mt-4 md:mt-12 lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-8">
            <div class="mx-auto w-full max-w-2xl sm:block lg:max-w-none">
              <span class="overflow-hidden rounded-md">
                <div class="h-[400px] w-full md:w-[400px]">
                  <img
                    loading="eager"
                    width={400}
                    height={400}
                    class="aspect-square h-full w-full rounded-md object-cover"
                    src={`/images/${productDetail.value.product.image}`}
                    alt={productDetail.value.product.name}
                  />
                </div>
              </span>
            </div>
            <div class="mt-10 px-4 sm:mt-16 sm:px-0 lg:mt-0">
              <div>
                <h3 class="sr-only">Description</h3>
                <div
                  class="text-base text-gray-700"
                  dangerouslySetInnerHTML={
                    productDetail.value.product.description
                  }
                />
              </div>
              <div class="mt-10 flex flex-col sm:flex-row sm:items-center">
                $ {productDetail.value.product.price}
                <div class="sm:flex-col1 flex px-4 align-baseline">
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
                          (p) => p.id === productDetail.value.product!.id,
                        );
                        if (cartProduct) {
                          cartProduct.quantity += 1;
                          store.cart.products = [...store.cart.products];
                        } else {
                          store.cart.products = [
                            ...store.cart.products,
                            { ...productDetail.value.product!, quantity: 1 },
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
                  <button
                    type="button"
                    class="ml-4 flex items-center justify-center rounded-md px-3 py-3 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
                  >
                    <HeartIcon
                      active={productDetail.value.isFavorite}
                      onClick$={async () => {
                        if (userSig.value) {
                          await changeFavorite(
                            userSig.value.id,
                            productDetail.value.product!.id,
                            !productDetail.value.isFavorite,
                          );
                          productDetail.value = {
                            ...productDetail.value,
                            isFavorite: !productDetail.value.isFavorite,
                          };
                        }
                      }}
                    />
                    <span class="sr-only">Add to favorites</span>
                  </button>
                </div>
              </div>

              <section class="mt-12 border-t pt-12 text-xs">
                <h3 class="mb-2 font-bold text-gray-600">Shipping & Returns</h3>
                <div class="space-y-1 text-gray-500">
                  <p>
                    Standard shipping: 3 - 5 working days. Express shipping: 1 -
                    3 working days.
                  </p>
                  <p>
                    Shipping costs depend on delivery address and will be
                    calculated during checkout.
                  </p>
                  <p>
                    Returns are subject to terms. Please see the{" "}
                    <span class="underline">returns page</span> for further
                    information.
                  </p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
