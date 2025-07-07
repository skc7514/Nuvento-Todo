export const parseSmsToTransaction = (sms: any) => {
  const { body, address, date } = sms;

  let type = '';
  if (body.toLowerCase().includes('credited')) type = 'Credit';
  else if (body.toLowerCase().includes('debited')) type = 'Debit';
  else type = 'unknown';

  const amountMatch = body.match(/(?:INR|Rs\.?|₹)\s?([\d,]+)/i);
  const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : 0;

  return {
    amount,
    type,
    bank: address,
    description: body,
    date: new Date(date),
  };
};