'use server';

import { z } from 'zod';
import { db } from './db';
import { randomUUID } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation'; 
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';
 

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}

const FormSchema = z.object({
    id: z.string(),
    customerId: z.string({
        invalid_type_error: 'Please select a customer.',
    }),
    amount: z.coerce.number()
    .gt(0, { message: 'Please enter an amount greater than $0.' }),
    status: z.enum(['pending', 'paid'], {
    invalid_type_error: 'Please select an invoice status.',
  }),
    date: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });
export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};

export async function createInvoice(prevState: State, formData: FormData) {
    const validatedFields = CreateInvoice.safeParse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Create Invoice.',
        };
    }

    const { customerId, amount, status } = validatedFields.data;

    const amountInCents = amount * 100;
    const date = new Date().toISOString().split('T')[0];
    const id = randomUUID();
    try{
    db.prepare(
        `
    INSERT INTO invoices (id, customer_id, amount, status, date)
    VALUES (?, ?, ?, ?, ?)
  `
    ).run(id, customerId, amountInCents, status, date);
    } catch (error) {
        console.error(error);
        return {
            message: 'Database Error: Failed to Create Invoice.',
        };
    }
    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
}
const UpdateInvoice = FormSchema.omit({ id: true, date: true });

// ...

export async function updateInvoice(
  id: string,
  prevState: State,
  formData: FormData,
) {
   const validatedFields = UpdateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
     if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Invoice.',
    };
  }
    const { customerId, amount, status } = validatedFields.data;

    const amountInCents = amount * 100;
    try {
    db.prepare(`
    UPDATE invoices
    SET customer_id = ?, amount = ?, status = ?
    WHERE id = ?
  `).run(customerId, amountInCents, status, id);}
   catch (error) {
    return { message: 'Database Error: Failed to Update Invoice.' };
  }

    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {
    if (id == null) { throw new Error('Invoice ID is required'); }

    try {
        db.prepare('DELETE FROM invoices WHERE id = ?').run(id);
        revalidatePath('/dashboard/invoices');
    }
    catch (error) {
        // We'll also log the error to the console for now
        console.error(error);
        return {
            message: 'Database Error: Failed to Delete Invoice. 1 1 1 ',
        };
    }

}



