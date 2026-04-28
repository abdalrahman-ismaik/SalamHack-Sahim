import { redirect } from 'next/navigation';

interface Props {
  params: { locale: string };
}

export default function StockIndexPage({ params }: Props) {
  redirect(`/${params.locale}`);
}
