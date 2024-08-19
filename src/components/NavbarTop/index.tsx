import { component$ } from "@builder.io/qwik";
import Logo from "~/assets/qwik.svg?jsx";
import { CartIcon } from "../CartIcon";

export const NavbarTop = component$(() => {
  return (
    <header
      class="z-50 flex h-14 bg-blue-700 text-white md:sticky md:-top-5 md:h-20 md:pt-2.5 md:shadow-md"
      data-testid="navbar-top"
    >
      <div class="max-w-screen-3xl sticky top-0 mx-auto flex w-full items-center gap-[clamp(1rem,3vw,3rem)] px-4 py-6 md:h-[60px] md:px-6 lg:px-10">
        <Logo class="mt-1 h-12 w-12" />
        <div class="flex w-full justify-center text-3xl font-bold">
          Qwik e-commerce
        </div>
        <CartIcon />
      </div>
    </header>
  );
});
