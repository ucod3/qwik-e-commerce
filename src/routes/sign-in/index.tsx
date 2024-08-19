import { component$ } from "@builder.io/qwik";
import { Form, Link, routeAction$, z, zod$ } from "@builder.io/qwik-city";
import { supabaseClient } from "~/utils/supabase";

export const useSignInAction = routeAction$(
  async ({ email, password }, requestEv) => {
    const { data } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });
    if (data.session) {
      requestEv.cookie.set("supabase_access_token", data.session.access_token, {
        path: "/",
      });
      throw requestEv.redirect(308, "/");
    }
    return { success: false };
  },
  zod$({
    email: z.string(),
    password: z.string(),
  }),
);

export default component$(() => {
  const signInAction = useSignInAction();
  return (
    <Form action={signInAction}>
      <section class="bg-gray-50">
        <div class="mx-auto flex flex-col items-center justify-center px-6 py-8 md:h-screen lg:py-0">
          <div class="w-full rounded-lg bg-white shadow">
            <div class="space-y-4 p-6 sm:p-8 md:space-y-6">
              <h1 class="text-xl font-bold leading-tight tracking-tight md:text-2xl">
                Sign in
              </h1>
              <div>
                <label for="email" class="mb-2 block text-sm font-medium">
                  Your email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 focus:border-blue-600 focus:ring-blue-600 sm:text-sm"
                />
              </div>
              <div>
                <label for="password" class="mb-2 block text-sm font-medium">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 focus:border-blue-600 focus:ring-blue-600 sm:text-sm"
                />
              </div>
              <button
                type="submit"
                class="w-full rounded-lg bg-blue-600 px-5 py-2.5 text-center text-sm font-medium text-white outline-none ring-4 ring-blue-500 hover:bg-blue-700"
              >
                Sign in
              </button>
              <div class="w-full text-center">
                <Link
                  href="/sign-up"
                  class="font-medium text-blue-600 hover:underline dark:text-blue-500"
                >
                  Sign up
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Form>
  );
});
