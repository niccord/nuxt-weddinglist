'use strict';

const { Router } = require('express');
const { Client } = require('pg');
const nodemailer = require('nodemailer');
const PdfMakePrinter = require('pdfmake/src/printer');
const stripeLib = require('stripe');
const SQL = require('@nearform/sql');

require('dotenv').config();

const bgImage = ''; // here you can set the bitecode of an image so it will be displayed inside the pdf document

const pgUser = process.env.POSTGRESUSER;
const pgPassword = process.env.POSTGRESPASSWORD;
const pgIp = process.env.POSTGRESSIP;
const pgPort = process.env.POSTGRESSPORT;
const pgDatabaseName = process.env.POSTGRESSDATABASENAME;
const connectionString = `postgresql://${pgUser}:${pgPassword}@${pgIp}:${pgPort}/${pgDatabaseName}`;
const client = new Client({ connectionString });
client.connect();

const router = Router();
const transporter = nodemailer.createTransport({
  service: process.env.MYEMAILSERVICE,
  auth: {
    user: process.env.MYEMAIL,
    pass: process.env.MYEMAILPASSWORD
  }
});

const stripe = stripeLib('sk_test_wctd8RF7ZkZ6NHAL1fQMPB1G');

const defaultMailOptions = {
  from: process.env.MYEMAIL,
  subject: 'Thanks for your donation'
};

function insertAnonymousPerson () {
  const query = `INSERT INTO PERSON VALUES (DEFAULT, NULL, NULL) RETURNING *`;
  return client.query(query);
}

function insertPayment (donation) {
  const signature = donation.id || 'signature';
  const created = donation.created ? new Date(donation.created) : new Date();
  const query = SQL`
    INSERT INTO payment (signature, message, total_amount, payment_type_id, confirmation_date, sign)
    VALUES (${signature}, ${donation.userMessage}, ${donation.amount}, 3, ${created.toISOString()}, ${donation.userSign})  RETURNING *
  `;
  return client.query(query);
}

function insertPurchases (donation, paymentId, personId) {
  const query = `
    INSERT INTO purchase (item_id, payment_id, person_id, amount)
    VALUES (${donation.item_id}, ${paymentId}, ${personId}, ${donation.amount}) RETURNING *
  `;
  return client.query(query);
}

const fonts = {
  Courier: {
    normal: 'Courier',
    bold: 'Courier-Bold',
    italics: 'Courier-Oblique',
    bolditalics: 'Courier-BoldOblique'
  },
  Helvetica: {
    normal: 'Helvetica',
    bold: 'Helvetica-Bold',
    italics: 'Helvetica-Oblique',
    bolditalics: 'Helvetica-BoldOblique'
  },
  Times: {
    normal: 'Times-Roman',
    bold: 'Times-Bold',
    italics: 'Times-Italic',
    bolditalics: 'Times-BoldItalic'
  },
  Symbol: {
    normal: 'Symbol'
  },
  ZapfDingbats: {
    normal: 'ZapfDingbats'
  }
};

function generatePdf (name, message) {
  return new Promise((resolve, reject) => {
    try {
      const printer = new PdfMakePrinter(fonts);

      const docDefinition = {
        pageSize: 'A4',
        background: [
          {
            image: bgImage,
            width: 595
          }
        ],
        pageMargins: [150, 400, 150, 200],
        alignment: 'center',
        content: [{text: 'This is my present for you:', alignment: 'center', color: '#764314'}],
        defaultStyle: {
          font: 'Helvetica'
        }
      };

      const pdfText = Object.assign({}, docDefinition);
      pdfText.content.push({text: `Contribution for ${name}`, margin: [0, 20, 0, 20], fontSize: 22, bold: true, alignment: 'center', color: '#764314'});
      if (message) {
        pdfText.content.push({text: message, italics: true, alignment: 'center', color: '#764314'});
      }
      const doc = printer.createPdfKitDocument(pdfText);

      const buffers = [];

      doc.on('data', (chunk) => {
        buffers.push(chunk);
      });

      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        return resolve(pdfData);
      });

      doc.end();
    } catch (err) {
      reject(err);
    }
  })
};

async function sendEmail (donation) {
  const { name, amount, email, userMessage, pdfSend, userSign } = donation;
  const mailOptions = Object.assign({}, defaultMailOptions);
  if (email.trim() !== '') {
    mailOptions.to = `${email}`;
  }
  mailOptions.bcc = process.env.BCCEMAIL;
  let message = `<h1>Thank you ${userSign}!</h1><p>Your contribution has been sent for ${name}<br>for an amout of ${amount} €</p>`;
  if (pdfSend) {
    message += `<p>If you'd like, you can print and brind them the attached PDF document</p>`;
  }
  if (userMessage) {
    message += `<h3>You have added the following message</h3><pre>${userMessage}</pre>`;
  }
  mailOptions.html = message;
  if (pdfSend) {
    const pdf = await generatePdf(name, userMessage);
    mailOptions.attachments = [{
      filename: 'attachment.pdf',
      content: pdf
    }];
  }
  return new Promise((resolve, reject) => transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.log('Email sent err', err);
      return reject(err);
    }
    console.log('Email sent info', info);
    return resolve('Email sent');
  }));
}

function createStripeCharge (amount, sender, tokenId) {
  return stripe.charges.create({
    amount: amount * 100,
    currency: 'eur',
    description: `Donation ${sender}`,
    source: tokenId
  });
}

router.post('/saveDonation', async function (req, res) {
  try {
    if (!req || !req.body || !req.body.params) {
      return res.status(400).send('missing parameters');
    }
    const { donation, tokenId, isBank } = req.body.params;

    if (!isBank) {
      await createStripeCharge(donation.amount, donation.userSign, tokenId);
    }

    let { personId } = donation;
    if (!personId) {
      const anon = await insertAnonymousPerson();
      personId = anon.rows[0].id;
    }

    // save one row for the payment on the `payment` table
    const payment = await insertPayment(donation);
    const paymentId = payment.rows[0].id;

    // insert/update as many rows as the user purchase on the `purchase` table with `payment_id`
    const purchase = await insertPurchases(donation, paymentId, personId);

    if (purchase.rowCount === 1) {
      // don't wait for the promise
      sendEmail(donation);
      return res.json('ok');
    }
    return res.status(400);
  } catch (err) {
    console.log('saveDonation err', err);
    return res.status(500);
  }
});

module.exports = router;
