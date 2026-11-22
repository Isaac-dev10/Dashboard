'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Form from '@/app/ui/invoices/edit-form';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import { fetchCustomers, fetchInvoiceById } from '@/app/lib/data';
import type { CustomerField, InvoiceForm } from '@/app/lib/definitions';

function EditInvoiceContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id') || '';
  const [invoice, setInvoice] = useState<InvoiceForm | null>(null);
  const [customers, setCustomers] = useState<CustomerField[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      if (!id) {
        setLoading(false);
        return;
      }
      try {
        const [inv, custs] = await Promise.all([
          fetchInvoiceById(id),
          fetchCustomers(),
        ]);
        if (isMounted) {
          setInvoice(inv ?? null);
          setCustomers(custs);
          setLoading(false);
        }
      } catch {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return <p className="text-gray-500">Loading invoice data...</p>;
  }

  if (!invoice) {
    return (
      <main>
        <Breadcrumbs
          breadcrumbs={[
            { label: 'Invoices', href: '/dashboard/invoices' },
            {
              label: 'Edit Invoice',
              href: `/dashboard/invoices/edit?id=${id}`,
              active: true,
            },
          ]}
        />
        <p className="mt-4 text-gray-500">Invoice not found.</p>
      </main>
    );
  }

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Invoices', href: '/dashboard/invoices' },
          {
            label: 'Edit Invoice',
            href: `/dashboard/invoices/edit?id=${id}`,
            active: true,
          },
        ]}
      />
      <Form invoice={invoice} customers={customers} />
    </main>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<p className="text-gray-500">Loading...</p>}>
      <EditInvoiceContent />
    </Suspense>
  );
}
