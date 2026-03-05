import { redirect } from 'next/navigation';

export default function LegacyAdminPageRedirect() {
  redirect('/bunker/admin');
}
