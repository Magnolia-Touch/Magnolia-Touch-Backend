export function generateCode(): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  const generateBlock = () => {
    let block = '';
    for (let i = 0; i < 5; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      block += charset[randomIndex];
    }
    return block;
  };

  return `${generateBlock()}-${generateBlock()}-${generateBlock()}`;
}

export function getOrCreateOrders(user_id: number) {
  let orders = this.prisma.orders.findFirst({
    where: { User_id: user_id },
  });

  if (!orders) {
    orders = this.prisma.orders.create({
      data: { User_id: user_id },
    });
  }

  return orders;
}

export function generateOrderIdforProduct(): string {
  const now = new Date();
  const pad = (n: number, width: number) => {
    return n.toString().padStart(width, '0');
  };
  const year = now.getFullYear();
  const month = pad(now.getMonth() + 1, 2);
  const day = pad(now.getDate(), 2);
  const hour = pad(now.getHours(), 2);
  const minute = pad(now.getMinutes(), 2);
  const second = pad(now.getSeconds(), 2);
  const timestamp = `${year}${month}${day}${hour}${minute}${second}`;
  return `MAGNOLIAPRODUCT${timestamp}`;
}

import { randomUUID } from 'crypto';

export function generateOrderIdforService(): string {
  return `MAGNOLIASERVICE-${Date.now()}-${randomUUID()}`;
}




import { randomInt } from 'crypto';
export async function generateUsername(
  firstName: string,
  date: string,
  checkExists: (username: string) => Promise<boolean>
): Promise<string> {

  // Base username
  const base = `${firstName.toLowerCase()}_${date}`;

  // 1️⃣ First check base username
  if (!(await checkExists(base))) {
    return base;
  }

  // 2️⃣ Try with numeric suffixes -1 to -5
  for (let i = 1; i <= 5; i++) {
    const attempt = `${base}-${i}`;
    if (!(await checkExists(attempt))) {
      return attempt;
    }
  }

  // 3️⃣ If all 5 taken → add random digits
  const randomSuffix = randomInt(10000, 99999); // 5-digit random number
  return `${base}-${randomSuffix}`;
}
