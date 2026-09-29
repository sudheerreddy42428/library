import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Inserting more books...');

  // Create Authors
  const authorsData = [
    { name: 'J.R.R. Tolkien', bio: 'English writer, poet, and philologist.' },
    { name: 'Stephen King', bio: 'American author of horror, supernatural fiction, suspense, crime, science-fiction, and fantasy novels.' },
    { name: 'Frank Herbert', bio: 'American science fiction author.' },
    { name: 'Arthur C. Clarke', bio: 'English science-fiction writer.' },
    { name: 'Andy Weir', bio: 'American novelist and software engineer.' },
    { name: 'Jane Austen', bio: 'English novelist known primarily for her six major novels.' },
    { name: 'F. Scott Fitzgerald', bio: 'American novelist and essayist.' }
  ];

  const authors: any = {};
  for (const data of authorsData) {
    const existing = await prisma.author.findFirst({ where: { name: data.name } });
    if (existing) {
      authors[data.name] = existing.id;
    } else {
      const author = await prisma.author.create({ data });
      authors[data.name] = author.id;
    }
  }
  console.log('Authors ready');

  // Create Categories
  const categoriesData = [
    'Fantasy', 'Horror', 'Science Fiction', 'Classic Literature', 'Romance'
  ];

  const categories: any = {};
  for (const name of categoriesData) {
    const category = await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    categories[name] = category.id;
  }
  console.log('Categories ready');

  const booksData = [
    {
      isbn: '9780544003415',
      title: 'The Lord of the Rings',
      description: 'An epic high-fantasy novel by English author and scholar J. R. R. Tolkien.',
      publisher: 'Houghton Mifflin Harcourt',
      publicationYear: 1954,
      quantity: 4,
      availableCopies: 4,
      coverImage: 'https://covers.openlibrary.org/b/isbn/9780544003415-M.jpg',
      authorId: authors['J.R.R. Tolkien'],
      categoryId: categories['Fantasy']
    },
    {
      isbn: '9780307743657',
      title: 'The Shining',
      description: 'A horror novel by American author Stephen King.',
      publisher: 'Anchor',
      publicationYear: 1977,
      quantity: 3,
      availableCopies: 3,
      coverImage: 'https://covers.openlibrary.org/b/isbn/9780307743657-M.jpg',
      authorId: authors['Stephen King'],
      categoryId: categories['Horror']
    },
    {
      isbn: '9780441172719',
      title: 'Dune',
      description: 'A 1965 epic science fiction novel by American author Frank Herbert.',
      publisher: 'Ace Books',
      publicationYear: 1965,
      quantity: 7,
      availableCopies: 7,
      coverImage: 'https://covers.openlibrary.org/b/isbn/9780441172719-M.jpg',
      authorId: authors['Frank Herbert'],
      categoryId: categories['Science Fiction']
    },
    {
      isbn: '9780451457998',
      title: '2001: A Space Odyssey',
      description: 'A 1968 science fiction novel by British writer Arthur C. Clarke.',
      publisher: 'Roc',
      publicationYear: 1968,
      quantity: 2,
      availableCopies: 2,
      coverImage: 'https://covers.openlibrary.org/b/isbn/9780451457998-M.jpg',
      authorId: authors['Arthur C. Clarke'],
      categoryId: categories['Science Fiction']
    },
    {
      isbn: '9780553418026',
      title: 'The Martian',
      description: 'A 2011 science fiction novel written by Andy Weir.',
      publisher: 'Crown',
      publicationYear: 2011,
      quantity: 5,
      availableCopies: 5,
      coverImage: 'https://covers.openlibrary.org/b/isbn/9780553418026-M.jpg',
      authorId: authors['Andy Weir'],
      categoryId: categories['Science Fiction']
    },
    {
      isbn: '9780141439518',
      title: 'Pride and Prejudice',
      description: 'An 1813 romantic novel of manners written by Jane Austen.',
      publisher: 'Penguin Classics',
      publicationYear: 1813,
      quantity: 6,
      availableCopies: 6,
      coverImage: 'https://covers.openlibrary.org/b/isbn/9780141439518-M.jpg',
      authorId: authors['Jane Austen'],
      categoryId: categories['Classic Literature']
    },
    {
      isbn: '9780743273565',
      title: 'The Great Gatsby',
      description: 'A 1925 novel by American writer F. Scott Fitzgerald.',
      publisher: 'Scribner',
      publicationYear: 1925,
      quantity: 3,
      availableCopies: 3,
      coverImage: 'https://covers.openlibrary.org/b/isbn/9780743273565-M.jpg',
      authorId: authors['F. Scott Fitzgerald'],
      categoryId: categories['Classic Literature']
    }
  ];

  for (const data of booksData) {
    await prisma.book.upsert({
      where: { isbn: data.isbn },
      update: {},
      create: data,
    });
  }
  console.log('Successfully inserted more books!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
