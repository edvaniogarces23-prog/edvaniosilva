import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { Resend } from 'resend';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Initialize Resend lazily to prevent crash if key is missing on startup
  let resend: Resend | null = null;
  const getResend = () => {
    const key = process.env.RESEND_API_KEY;
    if (!key) {
      console.warn('RESEND_API_KEY is not set. Emails will not be sent.');
      return null;
    }
    if (!resend) {
      resend = new Resend(key);
    }
    return resend;
  };

  // API Endpoint for Dinner Invitation
  app.post('/api/invite', async (req, res) => {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'O email é obrigatório.' });
    }

    const resendClient = getResend();
    
    // If no API key, simulate success for demo purposes
    if (!resendClient) {
      console.log('SIMULADO: Confirmação recebida para', email);
      return res.status(200).json({ 
        success: true, 
        message: 'Modo demonstração: Presença confirmada! (Configure a RESEND_API_KEY para enviar e-mails reais).' 
      });
    }

    try {
      const myEmail = process.env.VITE_MY_EMAIL || 'edvaniogarces23@gmail.com';
      
      // 1. Send confirmation to the guest
      // Note: In Resend test mode, this ONLY works if the 'to' is your verified email.
      const { data: guestData, error: guestError } = await resendClient.emails.send({
        from: 'Convite <onboarding@resend.dev>',
        to: email,
        subject: 'Um convite especial para você ✨',
        html: `
          <div style="font-family: serif; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #fffaf0;">
            <h1 style="color: #b91c1c; text-align: center; font-size: 28px;">Olá!</h1>
            <p style="font-size: 18px; line-height: 1.6; color: #374151;">
              Sua presença foi confirmada para o nosso encontro especial. 
            </p>
            <p style="font-size: 18px; line-height: 1.6; color: #374151;">
              Prepare-se para uma noite repleta de bons momentos.
            </p>
            <div style="text-align: center; margin-top: 40px;">
              <span style="display: inline-block; padding: 12px 24px; background-color: #b91c1c; color: white; border-radius: 9999px; font-weight: bold; text-decoration: none;">Nos vemos em breve ❤️</span>
            </div>
          </div>
        `
      });

      // 2. Send notification to the creator
      await resendClient.emails.send({
        from: 'Sistema <onboarding@resend.dev>',
        to: myEmail,
        subject: 'Novo Convite Confirmado! 🥂',
        html: `
          <div style="font-family: sans-serif; padding: 20px;">
            <h2>Boa notícia!</h2>
            <p>O convite para o jantar foi confirmado pelo e-mail: <strong>${email}</strong></p>
            <p>A convidada recebeu a confirmação automática.</p>
          </div>
        `
      });

      if (guestError) {
        console.error('Resend Error (Guest Email):', guestError);
        // If it's a verification error, we still want to show success in the UI for the flow
        // but log the technical issue.
        if (guestError.message.includes('single sender')) {
           return res.status(200).json({ 
             success: true, 
             message: 'Confirmado! (Aviso: O e-mail não foi enviado porque você está em modo teste do Resend e o destinatário não foi verificado).' 
           });
        }
        throw new Error(guestError.message);
      }

      res.status(200).json({ success: true, message: 'Confirmação enviada com sucesso!' });
    } catch (error: any) {
      console.error('Error sending email:', error);
      res.status(500).json({ error: 'Erro no serviço de e-mail: ' + error.message });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
