<script lang="ts">
  import * as Card from "$lib/components/ui/card/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { FieldGroup, Field, FieldLabel, FieldDescription } from "$lib/components/ui/field/index.js";
	import { InputGroup, InputGroupAddon, InputGroupInput } from "$lib/components/ui/input-group";
	import { LockIcon, MailIcon } from "lucide-svelte";
</script>

<Card.Root class="w-full max-w-lg shadow-lg p-8">
  <Card.Header class="flex flex-col items-center pb-8">
    <Card.Title class="font-retro text-3xl text-primary font-semibold pb-4">
      こんにちは
    </Card.Title>
    <Card.Title class="text-lg">
      Selamat Datang
    </Card.Title>
    <Card.Description class="text-center">
      Masuk ke akun Nihon no Hikari kamu untuk melanjutkan perjalanan belajar bahasa Jepang.
    </Card.Description>
  </Card.Header>
  <Card.Content>
    <form>
      <FieldGroup class="gap-4">
        <Field>
          <FieldLabel for="email">Email</FieldLabel>
          <InputGroup>
            <InputGroupAddon>
              <MailIcon />
            </InputGroupAddon>
            <InputGroupInput id="email" type="email" placeholder="nama@email.com" required />
          </InputGroup>
        </Field>
        <Field>
          <FieldLabel for="password">Password</FieldLabel>
          <InputGroup>
            <InputGroupAddon>
              <LockIcon />
            </InputGroupAddon>
            <InputGroupInput id="password" type="password" placeholder="Masukkan password" required />
          </InputGroup>
          <a href="##" class="ms-auto inline-block text-sm underline text-right"> Forgot your password? </a>
        </Field>
        <Field>
          <Button type="submit" class="w-full">Login</Button>
          <FieldDescription class="text-center">
            Don't have an account? <a href="##">Sign up</a>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  </Card.Content>
</Card.Root>