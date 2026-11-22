import {
  CustomerField,
  FormattedCustomersTable,
  InvoiceForm,
  InvoicesTable,
  Revenue,
  User,
} from './definitions';
import { formatCurrency } from './utils';
import {
  revenue as placeholderRevenue,
  customers as placeholderCustomers,
  invoices as placeholderInvoices,
  users as placeholderUsers,
} from './placeholder-data';

export async function fetchRevenue(): Promise<Revenue[]> {
  return placeholderRevenue;
}

export async function fetchLatestInvoices() {
  const latest = placeholderInvoices.slice(0, 5).map((invoice, index) => {
    const customer = placeholderCustomers.find((c) => c.id === invoice.customer_id);
    return {
      id: `inv-${index + 1}`,
      name: customer?.name ?? 'Unknown Customer',
      image_url: customer?.image_url ?? '/customers/evil-rabbit.png',
      email: customer?.email ?? 'customer@example.com',
      amount: formatCurrency(invoice.amount),
    };
  });
  return latest;
}

export async function fetchCardData() {
  const numberOfInvoices = placeholderInvoices.length;
  const numberOfCustomers = placeholderCustomers.length;
  const paid = placeholderInvoices
    .filter((inv) => inv.status === 'paid')
    .reduce((acc, curr) => acc + curr.amount, 0);
  const pending = placeholderInvoices
    .filter((inv) => inv.status === 'pending')
    .reduce((acc, curr) => acc + curr.amount, 0);

  return {
    numberOfCustomers,
    numberOfInvoices,
    totalPaidInvoices: formatCurrency(paid),
    totalPendingInvoices: formatCurrency(pending),
  };
}

const ITEMS_PER_PAGE = 6;

export async function fetchFilteredInvoices(
  query: string,
  currentPage: number,
): Promise<InvoicesTable[]> {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;
  const q = (query || '').toLowerCase();

  const allInvoices: InvoicesTable[] = placeholderInvoices.map((inv, index) => {
    const customer = placeholderCustomers.find((c) => c.id === inv.customer_id);
    const dateStr =
      typeof inv.date === 'string'
        ? inv.date
        : new Date(inv.date as unknown as string).toISOString().split('T')[0];
    return {
      id: `inv-${index + 1}`,
      customer_id: inv.customer_id,
      name: customer?.name ?? 'Unknown Customer',
      email: customer?.email ?? 'customer@example.com',
      image_url: customer?.image_url ?? '/customers/evil-rabbit.png',
      amount: inv.amount,
      date: dateStr,
      status: inv.status as 'pending' | 'paid',
    };
  });

  const filtered = allInvoices.filter((inv) => {
    return (
      inv.name.toLowerCase().includes(q) ||
      inv.email.toLowerCase().includes(q) ||
      String(inv.amount).includes(q) ||
      inv.date.includes(q) ||
      inv.status.toLowerCase().includes(q)
    );
  });

  return filtered.slice(offset, offset + ITEMS_PER_PAGE);
}

export async function fetchInvoicesPages(query: string): Promise<number> {
  const q = (query || '').toLowerCase();
  const allInvoices = placeholderInvoices.map((inv) => {
    const customer = placeholderCustomers.find((c) => c.id === inv.customer_id);
    return {
      name: customer?.name ?? '',
      email: customer?.email ?? '',
      amount: inv.amount,
      status: inv.status,
    };
  });

  const filtered = allInvoices.filter(
    (inv) =>
      inv.name.toLowerCase().includes(q) ||
      inv.email.toLowerCase().includes(q) ||
      String(inv.amount).includes(q) ||
      inv.status.toLowerCase().includes(q),
  );

  return Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;
}

export async function fetchInvoiceById(id: string): Promise<InvoiceForm | undefined> {
  const allInvoices = placeholderInvoices.map((inv, index) => ({
    id: `inv-${index + 1}`,
    customer_id: inv.customer_id,
    amount: inv.amount / 100,
    status: inv.status as 'pending' | 'paid',
  }));

  const found = allInvoices.find((inv) => inv.id === id) ?? allInvoices[0];
  return found ? { ...found } : undefined;
}

export async function fetchCustomers(): Promise<CustomerField[]> {
  return placeholderCustomers.map((c) => ({
    id: c.id,
    name: c.name,
  }));
}

export async function fetchFilteredCustomers(query: string): Promise<FormattedCustomersTable[]> {
  const q = (query || '').toLowerCase();

  return placeholderCustomers
    .filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q),
    )
    .map((c) => {
      const custInvoices = placeholderInvoices.filter((i) => i.customer_id === c.id);
      const totalPending = custInvoices
        .filter((i) => i.status === 'pending')
        .reduce((sum, i) => sum + i.amount, 0);
      const totalPaid = custInvoices
        .filter((i) => i.status === 'paid')
        .reduce((sum, i) => sum + i.amount, 0);

      return {
        id: c.id,
        name: c.name,
        email: c.email,
        image_url: c.image_url,
        total_invoices: custInvoices.length,
        total_pending: formatCurrency(totalPending),
        total_paid: formatCurrency(totalPaid),
      };
    });
}

export async function getUser(email: string): Promise<User | undefined> {
  return placeholderUsers.find((user) => user.email === email);
}
