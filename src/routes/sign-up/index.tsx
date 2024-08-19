import { component$, useSignal } from '@builder.io/qwik';
import { supabaseClient } from '../../utils/supabase';

export default component$(() => {
  const emailSig = useSignal('');
  const passwordSig = useSignal('');
  const messagesSig = useSignal('');

  return (
    <div class='container'>
      <label for='email'>Email</label>
      <input
        type='email'
        id='email'
        value={emailSig.value}
        onInput$={(_, el) => {
          emailSig.value = el.value;
        }}
      />
      <label for='password'>Password</label>
      <input type='password' id='password' bind:value={passwordSig} />

      {!!messagesSig.value && <p>{messagesSig.value}</p>}

      <button
        onClick$={async () => {
          const { error } = await supabaseClient.auth.signUp({
            email: emailSig.value,
            password: passwordSig.value,
          });
          messagesSig.value = error
            ? 'Error'
            : 'Success. Please check your email/spam folder for a confirmation email.';
        }}
      >
        Sign Up
      </button>
    </div>
  );
});
