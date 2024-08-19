import { component$ } from "@builder.io/qwik";
import { Form, routeAction$, z, zod$ } from "@builder.io/qwik-city";
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
      <div>
        <label for="email">Your email</label>
        <input type="email" name="email" id="email" />
      </div>
      <div>
        <label for="password">Password</label>
        <input type="password" name="password" id="password" />
      </div>
      <button type="submit">Sign in</button>
    </Form>
  );
});
