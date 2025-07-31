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

export function getOrCreateGuestBook(slug: string) {
  let guestbook = this.prisma.guestBook.findFirst({
    where: { deadPersonProfiles: slug },
  });

  if (!guestbook) {
    guestbook = this.prisma.guestBook.create({
      data: { deadPersonProfiles: slug },
    });
  }

  return guestbook;
}
