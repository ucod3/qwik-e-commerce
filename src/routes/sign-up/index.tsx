import { component$, useSignal } from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";
import { createSupabaseClient } from "~/utils/supabase";

export default component$(() => {
  const emailSig = useSignal("");
  const passwordSig = useSignal("");
  const messageSig = useSignal("");
  return (
    <section class="bg-gray-50">
      <div class="mx-auto flex flex-col items-center justify-center px-6 py-8 md:h-screen lg:py-0">
        <div class="w-full rounded-lg bg-white shadow">
          <div class="space-y-4 p-6 sm:p-8 md:space-y-6">
            <h1 class="text-xl font-bold leading-tight tracking-tight md:text-2xl">
              Sign up to your account
            </h1>
            <div>
              <label for="email" class="mb-2 block text-sm font-medium">
                Your email
              </label>
              <input
                type="email"
                id="email"
                bind:value={emailSig}
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
                bind:value={passwordSig}
                class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 focus:border-blue-600 focus:ring-blue-600 sm:text-sm"
              />
            </div>
            {!!messageSig.value && (
              <div class="w-full py-4 text-center">{messageSig.value}</div>
            )}
            <button
              type="submit"
              class="w-full rounded-lg bg-blue-600 px-5 py-2.5 text-center text-sm font-medium text-white outline-none ring-4 ring-blue-500 hover:bg-blue-700"
              onClick$={async () => {
                const supabaseClient = await createSupabaseClient();
                const { error } = await supabaseClient.auth.signUp({
                  email: emailSig.value,
                  password: passwordSig.value,
                });
                messageSig.value = error
                  ? "Error"
                  : "Success. Please check your email/spam folder";
              }}
            >
              Sign up
            </button>
            <div class="w-full text-center">
              <Link
                href="/sign-in"
                class="font-medium text-blue-600 hover:underline dark:text-blue-500"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});
