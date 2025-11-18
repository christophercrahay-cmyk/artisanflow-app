import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, metier, message } = body;

    // TODO: Replace with your email service (SendGrid, Resend, etc.)
    // For now, just log the data
    console.log('Contact form submission:', {
      name,
      email,
      phone,
      metier,
      message,
    });

    // Example: Send email via Resend, SendGrid, or other service
    // const response = await fetch('https://api.resend.com/emails', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     from: 'acontrecourant25@gmail.com',
    //     to: 'acontrecourant25@gmail.com',
    //     subject: `Nouveau message de ${name}`,
    //     html: `<p>De: ${name} (${email})</p><p>Métier: ${metier}</p><p>Téléphone: ${phone || 'N/A'}</p><p>Message: ${message}</p>`,
    //   }),
    // });

    return NextResponse.json(
      { success: true, message: 'Message envoyé avec succès' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error processing contact form:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors de l\'envoi du message' },
      { status: 500 }
    );
  }
}

